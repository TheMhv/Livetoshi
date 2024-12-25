import * as dotenv from "dotenv";
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
  };
};

export { loadConfig };
export type { Settings };
