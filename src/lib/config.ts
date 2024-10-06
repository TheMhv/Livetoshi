import * as dotenv from 'dotenv';
dotenv.config();

interface Settings {
  MIN_SATOSHI_QNT: number;
  MAX_TEXT_LENGTH: number;
  MODELS: [];
}

const loadConfig = (): Settings => {
  return {
    MIN_SATOSHI_QNT: parseInt(process.env.MIN_SATOSHI_QNT || '21', 10),
    MAX_TEXT_LENGTH: parseInt(process.env.MAX_TEXT_LENGTH || '200', 10),
    MODELS: JSON.parse(process.env.MODELS || "{}"),
  };
};

export { loadConfig };
export type { Settings };
