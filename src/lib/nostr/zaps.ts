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

  const text = `${message.name} enviou ${amount} satoshis: ${message.comment}`;

  return await nip57AnonymousZapRequest(
    new ZapRequestData(
      pubkey,
      [
        "wss://relay.snort.social",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://nostr.wine",
      ],
      text,
      amount * 1000,
      lnurl,
      eventID
    )
  );
}
