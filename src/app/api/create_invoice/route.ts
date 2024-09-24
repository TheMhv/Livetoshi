import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const response = await fetch(`http://${process.env.RVC_API_HOST}:${process.env.RVC_API_PORT}/create_invoice?amount=${data.amount}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: data.name,
        text: data.text,
        model: data.model,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json({ error: errorData.detail }, { status: response.status });
  }

  // Return the response as a streaming response
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}