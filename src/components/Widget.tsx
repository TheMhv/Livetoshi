"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from "react";
import {
  Event,
  EventSource,
  Filter,
  Kind,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { MsEdgeTTS } from "msedge-tts";
import { loadConfig, Settings } from "@/lib/config";
import { TriangleAlert } from "lucide-react";
import { NostrContext } from "./NostrProvider";

const config: Settings = loadConfig();

// Types for better type safet
interface TTSWidgetProps {
  pubkey: string;
  onEventProcessed?: (event: Event) => void;
}

// Utility functions moved outside component
const playAudio = async (source: string): Promise<void> => {
  const audio = new Audio(source);

  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);
    audio.play().catch(reject);
  });
};

const createTTS = async (text: string) => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(config.TTS.voice, config.TTS.format);
  return tts.toStream(text, {
    rate: config.TTS.rate,
    volume: config.TTS.volume,
    pitch: config.TTS.pitch,
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
  const { client } = useContext(NostrContext);

  const [queue, setQueue] = useState<Event[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [widgetText, setWidgetText] = useState("");
  const [errorText, setErrorText] = useState<string | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastZapRef = useRef<Event>();
  const isProcessingRef = useRef(false);

  // Fetch events handler
  const fetchEvents = useCallback(async () => {
    if (!client || !pubkey) return;

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
  }, [client, pubkey]);

  // Process queue handler
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queue.length === 0) return;

    isProcessingRef.current = true;
    const event = queue[0];

    try {
      const audioStream = await createTTS(event.content);
      const audioStreamData: Uint8Array[] = [];

      audioStream.on("data", (data: Uint8Array) => {
        audioStreamData.push(data);
      });

      audioStream.on("end", async () => {
        const audioData = Buffer.concat(audioStreamData).toString("base64");

        // Sequence of actions
        await playAudio(config.NOTIFY_AUDIO_URL);
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

        // Cleanup
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
  }, [queue, onEventProcessed]);

  // Set up polling
  useEffect(() => {
    const intervalId = setInterval(fetchEvents, config.QUEUE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  // Process queue when it changes
  useEffect(() => {
    processQueue();
  }, [queue, processQueue]);

  // Handle visibility animations
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

  // Remove logo if present
  useEffect(() => {
    const logoElement = document.getElementById("logo");
    if (logoElement) {
      logoElement.style.display = "none";
    }
  }, []);

  return (
    <>
      <div id="widget-container" ref={containerRef}>
        <div id="widget">{widgetText}</div>
      </div>

      {errorText && <ErrorAlert text={errorText} />}
    </>
  );
};
