import { NextRequest, NextResponse } from "next/server";
import { createInvoice, Invoice } from "@/lib/nostr/invoice";

interface RequestBody {
  npub: string;
  text: string;
  amount: number;
  eventId: string;
}

async function* check_payment(invoice: Invoice) {
  yield `data: ${JSON.stringify({ invoice: invoice })}\n\n`;

  const paymentRequest = await fetch(invoice.verify);
  let payment = await paymentRequest.json();

  while (!payment.settled) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const paymentRequest = await fetch(invoice.verify);
    payment = await paymentRequest.json();
  }

  yield `data: ${JSON.stringify({ status: "settled" })}\n\n`;
}

export async function POST(request: NextRequest) {
  const data: RequestBody = await request.json();

  const invoice = await createInvoice(
    data.npub,
    data.text,
    data.amount,
    data.eventId
  );

  if (!invoice) {
    return null;
  }

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of check_payment(invoice)) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });

  // Return the response as a streaming response
  return new NextResponse(stream, {
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    },
  });
}
