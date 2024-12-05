import {
  EventId,
  EventSource,
  Filter,
  Kind,
  loadWasmAsync,
  nip57AnonymousZapRequest,
  PublicKey,
  Timestamp,
  ZapRequestData,
} from "@rust-nostr/nostr-sdk";
import { clientConnect } from "./client";
import { loadConfig, Settings } from "../config";

const config: Settings = loadConfig();

export async function getFromEvent(id: string) {
  const client = await clientConnect();

  const eventId = EventId.parse(id);

  const filter = new Filter()
    .kind(new Kind(9735))
    .event(eventId)
    .until(Timestamp.now());

  const source = EventSource.relays();
  return await client.getEventsOf([filter], source);
}

export type Message = {
  name?: string;
  comment?: string;
  model?: string;
};

export async function createRequest(
  destination: string,
  message: Message,
  amount: number,
  eventId?: string,
  lnurl?: string
) {
  await loadWasmAsync();

  const pubkey = PublicKey.parse(destination);

  let eventID = undefined;
  if (eventId) {
    eventID = EventId.parse(eventId);
  }

  const text = `${message.name || "Anônimo"} enviou ${amount} satoshis: ${
    message.comment
  }`;

  return await nip57AnonymousZapRequest(
    new ZapRequestData(
      pubkey,
      config.RELAYS,
      text,
      amount * 1000,
      lnurl,
      eventID
    )
  );
}
