import { Client, loadWasmAsync } from "@rust-nostr/nostr-sdk";
import { getUser } from "./users";
import { createRequest, Message } from "./zaps";

export type Invoice = {
  status: string;
  verify: string;
  pr: string;
};

export async function createInvoice(
  destination: string,
  message: Message,
  amount: number,
  eventId: string
): Promise<Invoice | null> {
  await loadWasmAsync();

  const client = new Client();

  await client.addRelay("wss://relay.snort.social");
  await client.addRelay("wss://nos.lol");
  await client.addRelay("wss://relay.damus.io");
  await client.addRelay("wss://nostr.wine");
  await client.connect();

  const user = await getUser(destination);

  if (!user) {
    return null;
  }

  const ns = user.getLud16()?.split("@");

  if (!ns) {
    return null;
  }

  const lnurlp = await fetch(`https://${ns[1]}/.well-known/lnurlp/${ns[0]}`);

  if (!lnurlp.ok) {
    return null;
  }

  const lnData = await lnurlp.json();

  const callbackUrl = new URL(lnData.callback);

  const nostrEvent = await createRequest(destination, message, amount, eventId);

  const params = new URLSearchParams({
    ...Object.fromEntries(callbackUrl.searchParams),
    comment: message.comment || "",
    amount: Math.floor(amount * 1000).toString(),
    nostr: nostrEvent.asJson(),
  });

  const baseUrl = `${callbackUrl.protocol}//${callbackUrl.host}${callbackUrl.pathname}`;

  const invoiceRequest = await fetch(`${baseUrl}?${params}`);

  if (!invoiceRequest.ok) {
    return null;
  }

  return await invoiceRequest.json();
}
