"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Client,
  Event,
  EventSource,
  Filter,
  Kind,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { MsEdgeTTS } from "msedge-tts";
import { loadConfig, Settings } from "@/lib/config";
import { clientConnect } from "@/lib/nostr/client";

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

export const TTSWidget: React.FC<TTSWidgetProps> = ({
  pubkey,
  onEventProcessed,
}) => {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [queue, setQueue] = useState<Event[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [widgetText, setWidgetText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const lastZapRef = useRef<Event>();
  const isProcessingRef = useRef(false);

  // Fetch events handler
  const fetchEvents = useCallback(async () => {
    setClient(await clientConnect());

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
        console.error("Error processing audio stream:", error);
        isProcessingRef.current = false;
      });
    } catch (error) {
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
    <div id="widget-container" ref={containerRef}>
      <div id="widget">{widgetText}</div>
    </div>
  );
};
