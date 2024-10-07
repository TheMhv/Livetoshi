import { Client, loadWasmAsync } from "@rust-nostr/nostr-sdk";

let cachedClient: Client | null = null;

export async function clientConnect() {
  if (cachedClient) {
    return cachedClient;
  }

  await loadWasmAsync();

  const client = new Client();

  await client.addRelay("wss://relay.snort.social");
  await client.addRelay("wss://nos.lol");
  await client.addRelay("wss://relay.damus.io");
  await client.addRelay("wss://nostr.wine");
  await client.connect();

  cachedClient = client;
  return client;
}