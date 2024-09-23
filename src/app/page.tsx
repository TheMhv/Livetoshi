"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Home = () => {
  const [models, setModels] = useState([]);
  const [qrCode, setQRCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    text: "",
    amount: "",
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`/api/models`);
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (value) => {
    setFormData((prev) => ({ ...prev, model: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/create_invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create invoice");
      const data = await response.json();
      setQRCode(data.src);
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
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="mx-auto" />
          ) : (
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

              {models.length > 0 ? (
                <RadioGroup
                  value={formData.model}
                  onValueChange={handleModelChange}
                  className="grid grid-cols-2 gap-4"
                >
                  {models.map((model, index) => (
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
                  min={10}
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
};

export default Home;
