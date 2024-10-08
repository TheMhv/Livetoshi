import { Client, loadWasmAsync } from "@rust-nostr/nostr-sdk";

class NostrClientManager {
  private static instance: NostrClientManager;
  private client: Client | null = null;
  private initializationPromise: Promise<Client> | null = null;

  private constructor() {}

  public static getInstance(): NostrClientManager {
    if (!NostrClientManager.instance) {
      NostrClientManager.instance = new NostrClientManager();
    }
    return NostrClientManager.instance;
  }

  public async getClient(): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeClient();
    }

    return this.initializationPromise;
  }

  private async initializeClient(): Promise<Client> {
    await loadWasmAsync();

    const client = new Client();

    await client.addRelay("wss://relay.snort.social");
    await client.addRelay("wss://nos.lol");
    await client.addRelay("wss://relay.damus.io");
    await client.addRelay("wss://nostr.wine");
    await client.connect();

    this.client = client;
    return client;
  }
}

export async function clientConnect(): Promise<Client> {
  const manager = NostrClientManager.getInstance();
  return manager.getClient();
}