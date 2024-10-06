import {
  Client,
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

export async function getFromEvent(id: string) {
  await loadWasmAsync();

  const client = new Client();

  await client.addRelay("wss://relay.snort.social");
  await client.addRelay("wss://nos.lol");
  await client.addRelay("wss://relay.damus.io");
  await client.addRelay("wss://nostr.wine");
  await client.connect();

  const eventId = EventId.parse(id);

  const filter = new Filter()
    .kind(new Kind(9735))
    .event(eventId)
    .until(Timestamp.now());

  const source = EventSource.relays();
  return await client.getEventsOf([filter], source);
}

export async function createRequest(
  destination: string,
  comment: string,
  amount: number,
  eventId: string,
  lnurl?: string
) {
  await loadWasmAsync();

  const pubkey = PublicKey.parse(destination);
  const event = EventId.parse(eventId);

  return await nip57AnonymousZapRequest(
    new ZapRequestData(
      pubkey,
      [
        "wss://relay.snort.social",
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://nostr.wine",
      ],
      comment,
      amount * 1000,
      lnurl,
      event
    )
  );
}
