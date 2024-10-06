import {
  Client,
  EventId,
  EventSource,
  Filter,
  Kind,
  loadWasmAsync,
  PublicKey,
  Timestamp,
} from "@rust-nostr/nostr-sdk";

export async function getEvents(author: string, kind?: number) {
  await loadWasmAsync();

  const client = new Client();

  await client.addRelay("wss://relay.snort.social");
  await client.addRelay("wss://nos.lol");
  await client.addRelay("wss://relay.damus.io");
  await client.addRelay("wss://nostr.wine");
  await client.connect();

  const authorPubkey = PublicKey.parse(author);

  const filter = new Filter().author(authorPubkey).until(Timestamp.now());

  if (kind) {
    filter.kind(new Kind(kind));
  }

  const source = EventSource.relays();
  return await client.getEventsOf([filter], source);
}

export async function getEvent(id: string) {
  await loadWasmAsync();

  const client = new Client();

  await client.addRelay("wss://relay.snort.social");
  await client.addRelay("wss://nos.lol");
  await client.addRelay("wss://relay.damus.io");
  await client.addRelay("wss://nostr.wine");
  await client.connect();

  const eventId = EventId.parse(id);

  const filter = new Filter().id(eventId).until(Timestamp.now()).limit(1);

  const source = EventSource.relays();
  const events = await client.getEventsOf([filter], source);

  return events[0];
}
