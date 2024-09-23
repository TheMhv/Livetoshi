import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const response = await fetch("https://api.getalby.com/invoices", {
    method: "post",
    body: JSON.stringify({
      amount: data.amount,
      metadata: {
        name: data.name,
        text: data.text,
        model: data.model,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ALBY_TOKEN}`,
    },
  });

  const invoice = await response.json();

  return NextResponse.json({
    src: invoice.qr_code_svg,
    hash: invoice.payment_hash,
  });
}
