"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Config {
  models: { name: string }[];
  max_text_length?: number;
  min_satoshi_amount?: number;
}

interface FormData {
  name: string;
  model: string;
  text: string;
  amount: string;
}

export default function Home() {
  const [configs, setConfig] = useState<Config>({ models: [] });
  const [qrCode, setQRCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    model: "",
    text: "",
    amount: "",
  });

  useEffect(() => {
    const getConfigs = async () => {
      try {
        const response = await fetch(`/api/get_configs`);
        if (!response.ok) throw new Error("Failed to fetch configurations");
        const data: Config = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching configurations:", error);
      }
    };

    getConfigs();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, model: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create_invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

          if (parsedData.qr_code) {
            setQRCode(parsedData.qr_code);
          }

          if (parsedData.status === "settled") {
            setPaymentStatus(true);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">LiveSatoshi</h2>
          <p className="text-center text-gray-600">
            Envie uma mensagem usando satoshis
          </p>
        </CardHeader>
        <CardContent>
          {qrCode && !paymentStatus && (
            <Image
              src={qrCode}
              alt="QR Code"
              width={800}
              height={800}
              className="mx-auto"
            />
          )}
          {paymentStatus && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Pagamento bem-sucedido!
              </h3>
              <p className="text-gray-600">Obrigado por usar o LiveSatoshi.</p>
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

              {configs?.models?.length > 0 ? (
                <RadioGroup
                  value={formData.model}
                  onValueChange={handleModelChange}
                  className="grid grid-cols-2 gap-4"
                >
                  {configs.models.map((model, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={model.name}
                        id={`model-${index}`}
                      />
                      <Label
                        htmlFor={`model-${index}`}
                        className="flex items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:text-blue-500 hover:bg-gray-50 w-full"
                      >
                        {model.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-gray-500">Nenhum modelo disponível</p>
              )}

              <div>
                <Label htmlFor="text">Mensagem</Label>
                <Input
                  id="text"
                  name="text"
                  value={formData.text}
                  maxLength={configs?.max_text_length || 200}
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
                  min={configs?.min_satoshi_amount || 100}
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Enviar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
