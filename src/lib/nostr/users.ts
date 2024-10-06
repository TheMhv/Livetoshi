import { Client, loadWasmAsync, PublicKey } from "@rust-nostr/nostr-sdk";

export async function getUser(npub: string) {
    await loadWasmAsync();

    const client = new Client();

    await client.addRelay("wss://relay.snort.social");
    await client.addRelay("wss://nos.lol");
    await client.addRelay("wss://relay.damus.io");
    await client.addRelay("wss://nostr.wine");
    await client.connect();

    const pubKey = PublicKey.parse(npub);
    return await client.fetchMetadata(pubKey);
}