import * as dotenv from "dotenv";
import { OUTPUT_FORMAT, PITCH, RATE, VOLUME } from "msedge-tts";
dotenv.config();

interface Settings {
  MIN_SATOSHI_QNT: number;
  MAX_TEXT_LENGTH: number;
  MODELS: string[];
  RELAYS: string[];
  NOTIFY_AUDIO_URL: string;
  QUEUE_CHECK_INTERVAL: number;
  WIDGET_DISPLAY_DELAY: number;
  WIDGET_HIDE_DELAY: number;
  TTS: {
    voice: string;
    rate: RATE | string | number;
    volume: VOLUME | string | number;
    pitch: PITCH | string;
    format: OUTPUT_FORMAT;
  };
}

const loadConfig = (): Settings => {
  return {
    MIN_SATOSHI_QNT: parseInt(process.env.MIN_SATOSHI_QNT || "21", 10),
    MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH || "200", 10),
    MODELS: process.env.MODELS?.split(",") || [],
    RELAYS: process.env.RELAYS?.split(",") || [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://relay.snort.social",
      "wss://nostr.wine",
      "wss://wot.nostr.net",
      "wss://relay.nostr.net",
    ],
    NOTIFY_AUDIO_URL: process.env.NOTIFY_AUDIO_URL || "/notification.mp3",
    QUEUE_CHECK_INTERVAL: parseInt(process.env.QUEUE_CHECK_INTERVAL || "3000"),
    WIDGET_DISPLAY_DELAY: parseInt(process.env.WIDGET_DISPLAY_DELAY || "2000"),
    WIDGET_HIDE_DELAY: parseInt(process.env.WIDGET_HIDE_DELAY || "5000"),
    TTS: {
      voice: process.env.VOICE || "pt-BR-ThalitaNeural",
      rate: process.env.RATE || "0%",
      volume: process.env.VOLUME || "0%",
      pitch: process.env.PITCH || "0%",
      format: OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
    },
  };
};

export { loadConfig };
export type { Settings };
