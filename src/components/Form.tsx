"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

import { Settings } from "@/lib/config";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LuArrowRight,
  LuCopy,
  LuLoader2,
  LuMail,
  LuMic,
  LuUndo2,
  LuUser,
  LuZap,
} from "react-icons/lu";

interface FormData {
  name: string;
  text: string;
  model: string;
  amount: string;
}

interface FormProps {
  npub: string;
  config: Settings;
  eventId?: string;
}

export default function Form({ npub, config, eventId = undefined }: FormProps) {
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

          <p className="text-gray-600">Obrigado por ajudar na nossa meta!.</p>

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <LuUser /> Nome de Usuário
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {config.MODELS?.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LuMic /> Modelo de Voz
                </Label>

                <RadioGroup
                  value={formData.model}
                  onValueChange={handleModelChange}
                  className="grid grid-cols-2 gap-4"
                >
                  {config.MODELS.map((model, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={model}
                        id={`model-${index}`}
                        className="peer aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <Label
                        htmlFor={`model-${index}`}
                        className={cn(
                          "flex items-center justify-center p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 w-full",
                          formData.model === model
                            ? "border-2 border-primary text-primary"
                            : "border border-primary/50"
                        )}
                      >
                        {model}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="text" className="flex items-center gap-2">
              <LuMail /> Mensagem
            </Label>
            <Input
              id="text"
              name="text"
              value={formData.text}
              maxLength={config.MAX_TEXT_LENGTH || 200}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <LuZap /> Quantidade de satoshis
            </Label>

            <Input
              id="amount"
              name="amount"
              type="number"
              min={config.MIN_SATOSHI_QNT || 100}
              value={formData.amount}
              onChange={handleInputChange}
              required
            />

            <p className="text-xs text-right text-card-foreground/75">
              Quantidade mínima:{" "}
              <span className="font-bold">{config.MIN_SATOSHI_QNT} sats</span>
            </p>
          </div>

          <Button
            type="submit"
            className="text-center w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                {"Criando invoice..."}
                <LuLoader2 className="animate-spin ml-2" />
              </>
            ) : (
              <>
                {"Continuar"}
                <LuArrowRight className="ml-2" />
              </>
            )}
          </Button>
        </form>
      )}
    </>
  );
}
