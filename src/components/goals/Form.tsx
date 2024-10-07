"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Settings } from "@/lib/config";

interface FormData {
  name: string;
  text: string;
  model: string;
  amount: string;
}

interface FormProps {
  npub: string;
  eventId: string;
  config: Settings;
  //   onPaymentSettled: (amount: number) => void;
}

export default function Form({
  npub,
  eventId,
  config,
}: //   onPaymentSettled,
FormProps) {
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

      while (true) {
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
            } catch (error) {
              console.error(error);
              setQRCode(await QRCode.toDataURL(parsedData.invoice.pr));
              setInvoice(parsedData.invoice.pr);
            }
          }

          if (parsedData.status === "settled") {
            setPaymentStatus(true);
            // onPaymentSettled(Number(formData.amount) * 1000);
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
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Pagar com Lightning
            </a>
          </div>

          <Button
            onClick={() => {
              setQRCode("");
              setPaymentStatus(false);
              setIsSubmitting(false);
              setInvoice("");
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            Voltar
          </Button>
        </>
      )}
      {paymentStatus && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-green-600 mb-2">
            Pagamento bem-sucedido!
          </h3>

          <p className="text-gray-600">Obrigado por ajudar na nossa meta!.</p>

          <div className="mt-6">
            <Button
              onClick={() => {
                setQRCode("");
                setPaymentStatus(false);
                setIsSubmitting(false);
                setInvoice("");
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              Voltar
            </Button>
          </div>
        </div>
      )}
      {!qrCode && !paymentStatus && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nome de Usuário</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {config.MODELS?.length > 0 && (
            <RadioGroup
              value={formData.model}
              onValueChange={handleModelChange}
              className="grid grid-cols-2 gap-4"
            >
              {config.MODELS.map((model, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={model} id={`model-${index}`} />
                  <Label
                    htmlFor={`model-${index}`}
                    className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:text-blue-500 hover:bg-gray-50 w-full"
                  >
                    {model}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <div>
            <Label htmlFor="text">Mensagem</Label>
            <Input
              id="text"
              name="text"
              value={formData.text}
              maxLength={config.MAX_TEXT_LENGTH || 200}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Quantidade de satoshis</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={config.MIN_SATOSHI_QNT || 100}
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      )}
    </>
  );
}
