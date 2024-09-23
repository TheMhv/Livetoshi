import { NextRequest, NextResponse } from 'next/server';

async function checkInvoiceStatus(invoice_hash: string): Promise<boolean> {
  const response = await fetch(
    `https://api.getalby.com/invoices/${invoice_hash}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ALBY_TOKEN}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const invoice = await response.json();
  
  return invoice.settled;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const payment_hash = searchParams.get('payment_hash');

  if (!payment_hash) {
    return NextResponse.json({ error: 'Invalid payment_hash' }, { status: 400 });
  }

  try {
    const invoiceStatus = await checkInvoiceStatus(payment_hash);
    return NextResponse.json({ status: invoiceStatus });
  } catch (error) {
    console.error('Error checking invoice:', error);
    return NextResponse.json({ error: 'Failed to check invoice' }, { status: 500 });
  }
}