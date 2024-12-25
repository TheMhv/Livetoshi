"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Client,
  Event,
  EventSource,
  Filter,
  Kind,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { MsEdgeTTS, OUTPUT_FORMAT, Voice } from "msedge-tts";
import { loadConfig, Settings } from "@/lib/config";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { clientConnect } from "@/lib/nostr/client";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "./ui/card";
import Logo from "./logo";
import { Select } from "./ui/select";
import { Range } from "./ui/range";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LuArrowRight } from "react-icons/lu";
import { RemoveLogo } from "./utils/RemoveLogo";

const config: Settings = loadConfig();

interface TTSWidgetProps {
  pubkey: string;
  onEventProcessed?: (event: Event) => void;
}

const playAudio = async (source: string): Promise<void> => {
  const audio = new Audio(source);

  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);
    audio.play().catch(reject);
  });
};

const createTTS = async (
  text: string,
  voice: string,
  rate: string,
  volume: string,
  pitch: string
) => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  return tts.toStream(text, {
    rate: `${rate}%`,
    volume: `${volume}%`,
    pitch: `${pitch}%`,
  });
};

const ErrorAlert: React.FC<{ text: string }> = ({ text }) => (
  <div className="fixed bottom-0 left-0 z-50 p-4 sm:p-5">
    <div
      className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-neutral-300"
      role="alert"
    >
      <TriangleAlert className="flex-shrink-0 inline size-4 me-2" />

      <span className="sr-only">Error</span>

      <div>
        <span className="font-medium">Error!</span>
        {text}
      </div>
    </div>
  </div>
);

export const TTSWidget: React.FC<TTSWidgetProps> = ({
  pubkey,
  onEventProcessed,
}) => {
  const [client, setClient] = useState<Client>();

  const [queue, setQueue] = useState<Event[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [widgetText, setWidgetText] = useState("");
  const [errorText, setErrorText] = useState<string | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastZapRef = useRef<Event>();
  const isProcessingRef = useRef(false);

  const params = useSearchParams();

  const ttsVoice = params.get("voice") || "";
  const ttsRate = params.get("rate") || "0";
  const ttsVolume = params.get("volume") || "0";
  const ttsPitch = params.get("pitch") || "0";

  const min_sats = parseInt(params.get("min_sats") || "0");
  const max_text = parseInt(params.get("max_text") || "0");

  const fetchEvents = useCallback(async () => {
    if (!client) {
      setClient(await clientConnect());
    }

    if (!client || !pubkey || !ttsVoice) return;

    try {
      const filter = new Filter()
        .pubkey(PublicKey.parse(pubkey))
        .kind(new Kind(9735))
        .until(Timestamp.now())
        .since(Timestamp.fromSecs(Timestamp.now().asSecs() - 36000));

      const eventsData = (
        await client.getEventsOf([filter], EventSource.relays())
      ).sort((a, b) => b.createdAt.asSecs() - a.createdAt.asSecs());

      const latestEvent = eventsData[0];

      if (
        latestEvent &&
        latestEvent.id.toHex() !== lastZapRef.current?.id.toHex()
      ) {
        lastZapRef.current = latestEvent;
        setQueue((prev) => [latestEvent, ...prev]);
      }
    } catch (error) {
      setErrorText("Error processing audio stream");
      console.error("Error fetching events:", error);
    }
  }, [client, pubkey, ttsVoice]);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queue.length === 0) return;

    isProcessingRef.current = true;
    const event = queue[0];

    try {
      if (min_sats) {
        const description = event.getTagContent("description");
        if (description) {
          const amount = parseInt(
            Event.fromJson(description).getTagContent("amount") || "0"
          );

          if (amount && amount / 1000 < min_sats) {
            isProcessingRef.current = false;
            return;
          }
        }
      }

      let content = event.content;
      if (max_text) {
        content = content.substring(0, max_text);
      }

      const audioStream = await createTTS(
        content,
        ttsVoice,
        ttsRate,
        ttsVolume,
        ttsPitch
      );
      const audioStreamData: Uint8Array[] = [];

      audioStream.on("data", (data: Uint8Array) => {
        audioStreamData.push(data);
      });

      audioStream.on("end", async () => {
        const audioData = Buffer.concat(audioStreamData).toString("base64");

        await playAudio(config.NOTIFY_AUDIO_URL).catch(() =>
          setErrorText("Error when play audio")
        );

        setWidgetText(event.content);
        setIsVisible(true);

        await new Promise((resolve) =>
          setTimeout(resolve, config.WIDGET_DISPLAY_DELAY)
        );

        await playAudio(`data:audio/mp4;base64,${audioData}`);
        setIsVisible(false);

        await new Promise((resolve) =>
          setTimeout(resolve, config.WIDGET_HIDE_DELAY)
        );

        setQueue((prev) => prev.slice(1));
        onEventProcessed?.(event);
        isProcessingRef.current = false;
      });

      audioStream.on("error", (error) => {
        setErrorText("Error processing audio stream");
        console.error("Error processing audio stream:", error);
        isProcessingRef.current = false;
      });
    } catch (error) {
      setErrorText("Error processing event");
      console.error("Error processing event:", error);
      isProcessingRef.current = false;
    }
  }, [
    queue,
    min_sats,
    max_text,
    ttsVoice,
    ttsRate,
    ttsVolume,
    ttsPitch,
    onEventProcessed,
  ]);

  useEffect(() => {
    try {
      const intervalId = setInterval(fetchEvents, config.QUEUE_CHECK_INTERVAL);
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error set up polling:", error);
      setErrorText("Error set up polling");
    }
  }, [fetchEvents]);

  useEffect(() => {
    try {
      processQueue();
    } catch (error) {
      console.error("Error process queue:", error);
      setErrorText("Error process queue");
    }
  }, [queue, processQueue]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isVisible) {
      containerRef.current.style.display = "block";
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.classList.add("animate-in");
        }
      });
    } else {
      containerRef.current.classList.remove("animate-in");
      containerRef.current.classList.add("animate-out");

      const timeout = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.display = "none";
          containerRef.current.classList.remove("animate-out");
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  return ttsVoice ? (
    <>
      <RemoveLogo />

      <div id="widget-container" ref={containerRef}>
        <div id="widget">{widgetText}</div>
      </div>
      {errorText && <ErrorAlert text={errorText} />}
    </>
  ) : (
    <Configuration />
  );
};

const Configuration: React.FC = () => {
  const [voices, setVoices] = useState<Voice[]>();

  useEffect(() => {
    const tts = new MsEdgeTTS();
    tts.getVoices().then((data) => setVoices(data));
  }, []);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <Logo className="text-3xl text-center my-2" />

        <p className="text-center text-gray-600">
          Configure your widget to receive alerts
        </p>
      </CardHeader>

      <CardContent>
        {voices ? (
          <form action="" method="GET" className="space-y-4">
            <Select name="voice" required>
              <option value="">Select TTS Voice</option>

              {voices.map((voice, index) => (
                <option key={index} value={voice.ShortName}>
                  {voice.FriendlyName}
                </option>
              ))}
            </Select>

            <div>
              <Label htmlFor="rate">Rate:</Label>
              <Range
                id="rate"
                name="rate"
                min={-100}
                max={100}
                defaultValue={0}
                indicator
              />
            </div>

            <div>
              <Label htmlFor="volume">Volume:</Label>
              <Range
                id="volume"
                name="volume"
                min={-100}
                max={100}
                defaultValue={0}
                indicator
              />
            </div>

            <div>
              <Label htmlFor="pitch">Pitch:</Label>
              <Range
                id="pitch"
                name="pitch"
                min={-100}
                max={100}
                defaultValue={0}
                indicator
              />
            </div>

            <div>
              <Label htmlFor="min_sats">Minimum Sats:</Label>
              <Input
                id="min_sats"
                name="min_sats"
                type="number"
                min={0}
                defaultValue={config.MIN_SATOSHI_QNT}
              />
            </div>

            <div>
              <Label htmlFor="max_text">Maximum text length:</Label>
              <Input
                id="max_text"
                name="max_text"
                type="number"
                min={0}
                defaultValue={config.MAX_TEXT_LENGTH}
              />
            </div>

            <Button type="submit" className="text-center w-full">
              Confirm <LuArrowRight className="ml-2" />
            </Button>
          </form>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <LoaderCircle className="animate-spin size-4" /> Loading...
          </span>
        )}
      </CardContent>
    </Card>
  );
};
