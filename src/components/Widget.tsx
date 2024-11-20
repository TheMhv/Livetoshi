"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { NostrContext } from "./NostrProvider";
import {
  Event,
  EventSource,
  Filter,
  Kind,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const NOTIFY_AUDIO_URL = "/notification.mp3";
const QUEUE_CHECK_INTERVAL = 3000;
const WIDGET_DISPLAY_DELAY = 2000;
const WIDGET_HIDE_DELAY = 5000;

const TTSCONFIG = {
  voice: "en-US-AndrewNeural",
  rate: "0%",
  volume: "0%",
  pitch: "0%",
};

const playAudio = async (source: string) => {
  const audio = new Audio(source);

  return new Promise((resolve, reject) => {
    audio.onended = resolve;
    audio.onerror = reject;
    audio.play().catch(reject);
  });
};

const createTTS = async (text: string) => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    TTSCONFIG.voice,
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  );
  return tts.toStream(text, {
    rate: TTSCONFIG.rate,
    volume: TTSCONFIG.volume,
    pitch: TTSCONFIG.pitch,
  });
};

export const TTSWidget = ({ pubkey }: { pubkey: string }) => {
  const { client } = useContext(NostrContext);
  const [queue, setQueue] = useState<Event[]>([]);

  useEffect(() => {
    if (!client || !pubkey) return;

    let lastZap: Event | undefined = undefined;

    const fetchData = async () => {
      const filter = new Filter()
        .pubkey(PublicKey.parse(pubkey))
        .kind(new Kind(9735))
        .until(Timestamp.now())
        .since(Timestamp.fromSecs(Timestamp.now().asSecs() - 36000));

      const source = EventSource.relays();

      const eventsData = (await client.getEventsOf([filter], source)).sort(
        (a, b) => {
          const aTime = a.createdAt.asSecs();
          const bTime = b.createdAt.asSecs();

          return aTime == bTime ? 0 : aTime > bTime ? 1 : -1;
        }
      );

      if (eventsData && eventsData.at(-1)?.id.toHex() !== lastZap?.id.toHex()) {
        lastZap = eventsData.at(-1);
        setQueue((prevQueue) => [lastZap!, ...prevQueue]);
      }
    };

    const intervalId = setInterval(fetchData, QUEUE_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [client, pubkey]);

  for (let i = 0; i < queue.length; i++) {
    const zap = queue.shift();

    if (!zap) continue;

    createTTS(zap.content).then((audioStream) => {
      const audioStreamData: Uint8Array[] = [];

      audioStream.on("data", (data: Uint8Array) => {
        audioStreamData.push(data);
      });

      audioStream.on("end", async () => {
        const audioData = Buffer.concat(audioStreamData).toString("base64");
        await playAudio(NOTIFY_AUDIO_URL);
        setWidgetText(zap.content);
        setIsVisible(true);
        await new Promise((resolve) =>
          setTimeout(resolve, WIDGET_DISPLAY_DELAY)
        );

        await playAudio(`data:audio/mp4;base64,${audioData}`);
        setIsVisible(false);
        await new Promise((resolve) => setTimeout(resolve, WIDGET_HIDE_DELAY));
      });
    });
  }

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [widgetText, setWidgetText] = useState<string>("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      containerRef.current.style.display = "block";

      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.classList.add("animate-in");
        }
      });
    } else {
      if (containerRef.current) {
        containerRef.current.classList.remove("animate-in");
        containerRef.current.classList.add("animate-out");
      }

      setTimeout(() => {
        containerRef.current.style.display = "none";
        containerRef.current.classList.remove("animate-out");

        setIsVisible(false);
      }, 500);
    }
  }, [isVisible]);

  const logoElement = document.getElementById("logo");
  if (logoElement) {
    logoElement.style.display = "none";
  }

  return (
    <div id="widget-container" ref={containerRef} className="my-10">
      <div id="widget">{widgetText}</div>
    </div>
  );
};
