"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LuCopy, LuUndo2 } from "react-icons/lu";
import FormEnvioMensagem from "./FormEnvioMensagem";

interface FormData {
  name: string;
  text: string;
  model: string;
  amount: string;
}

interface FormProps {
  npub: string;
  options: {
    MODELS: string[];
    MAX_TEXT_LENGTH: number;
    MIN_SATOSHI_QNT: number;
  };
  eventId?: string;
}

export default function Form({
  npub,
  options,
  eventId = undefined,
}: FormProps) {
  const [qrCode, setQRCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    text: "",
    model: "",
    amount: "",
  });
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, model: value }));
  };

  const handleQRCodeClick = () => {
    if (invoice) {
      window.open(`lightning:${invoice}`, "_blank");
    }
  };

  const handleCopyInvoice = () => {
    if (invoiceInputRef.current) {
      invoiceInputRef.current.select();
      document.execCommand("copy");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create_invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npub: npub,
          eventId: eventId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      let loop = true;
      while (loop) {
        const { value, done } = await reader.read();
        if (done) break;

        const decodedChunk = decoder.decode(value, { stream: true });
        const events = decodedChunk.split("\n\n");

        for (const event of events) {
          if (event.trim() === "") continue;

          const [, data] = event.split("data: ");
          const parsedData = JSON.parse(data);

          if (parsedData.invoice) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              await window.webln.enable();
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              await window.webln.sendPayment(parsedData.invoice.pr);
              setPaymentStatus(true);
              loop = false;
              break;
            } catch (error) {
              console.error(error);
              setQRCode(await QRCode.toDataURL(parsedData.invoice.pr));
              setInvoice(parsedData.invoice.pr);
            }
          }

          if (parsedData.status === "settled") {
            setPaymentStatus(true);
            loop = false;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {qrCode && !paymentStatus && (
        <>
          <div onClick={handleQRCodeClick} className="cursor-pointer">
            <Image
              src={qrCode}
              alt="QR Code"
              width={800}
              height={800}
              className="mx-auto"
            />
          </div>

          <div className="text-center mb-4">
            <a
              href={`lightning:${invoice}`}
              className="text-primary hover:text-secondary underline"
            >
              Pagar com Lightning
            </a>
          </div>

          <div className="mb-4">
            <Label htmlFor="invoice">Invoice</Label>
            <div className="flex">
              <Input
                id="invoice"
                ref={invoiceInputRef}
                value={invoice}
                readOnly
                className="flex-grow"
              />
              <Button onClick={handleCopyInvoice} className="ml-2">
                {copySuccess ? (
                  "Copiado!"
                ) : (
                  <>
                    {"Copiar"}
                    <LuCopy className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <Button
            onClick={() => {
              setQRCode("");
              setPaymentStatus(false);
              setIsSubmitting(false);
              setInvoice("");
              setCopySuccess(false);
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            Voltar
            <LuUndo2 className="ml-2" />
          </Button>
        </>
      )}
      {paymentStatus && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-green-600 mb-2">
            Pagamento bem-sucedido!
          </h3>

          {eventId ? (
            <p className="text-gray-600">Obrigado por ajudar na nossa meta!.</p>
          ) : (
            <p className="text-gray-600">Obrigado por usar o LiveSatoshi.</p>
          )}

          <div className="mt-6">
            <Button
              onClick={() => {
                setQRCode("");
                setPaymentStatus(false);
                setIsSubmitting(false);
                setInvoice("");
                setCopySuccess(false);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              Voltar
              <LuUndo2 className="ml-2" />
            </Button>
          </div>
        </div>
      )}
      {!qrCode && !paymentStatus && (
        <FormEnvioMensagem
          formData={formData}
          options={options}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          handleModelChange={handleModelChange}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
