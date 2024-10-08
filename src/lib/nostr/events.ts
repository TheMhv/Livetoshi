import {
  EventId,
  EventSource,
  Filter,
  Kind,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";
import { clientConnect } from "./client";

export async function getEvents(author: string, kind?: number) {
  const client = await clientConnect();

  const authorPubkey = PublicKey.parse(author);

  const filter = new Filter().author(authorPubkey).until(Timestamp.now());

  if (kind) {
    filter.kind(new Kind(kind));
  }

  const source = EventSource.relays();
  return await client.getEventsOf([filter], source);
}

export async function getEvent(id: string) {
  const client = await clientConnect();

  const eventId = EventId.parse(id);

  const filter = new Filter().id(eventId).until(Timestamp.now()).limit(1);

  const source = EventSource.relays();
  const events = await client.getEventsOf([filter], source);

  return events[0];
}
