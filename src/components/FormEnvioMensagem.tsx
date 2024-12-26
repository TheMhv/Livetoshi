"use client";

import { LuArrowRight, LuLoader, LuMail, LuMic, LuUser, LuZap } from "react-icons/lu";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface FormData {
    name: string;
    text: string;
    model: string;
    amount: string;
  }
  
  export interface Options {
    MODELS: string[];
    MAX_TEXT_LENGTH: number;
    MIN_SATOSHI_QNT: number;
  }
  
  export interface Form2Props {
    formData: FormData;
    options: Options;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleModelChange: (value: string) => void;
    isSubmitting: boolean;
    qrCode?: string;
    paymentStatus?: boolean;
  }

export default function FormEnvioMensagem({ formData, options, handleSubmit, handleInputChange, handleModelChange, isSubmitting }: Form2Props) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base">
          <LuUser className="w-4 h-4 sm:w-5 sm:h-5" /> Nome de Usuário
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>

      {options.MODELS.length > 0 && (
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm sm:text-base">
              <LuMic className="w-4 h-4 sm:w-5 sm:h-5" /> Modelo de Voz
            </Label>

            <RadioGroup
              value={formData.model}
              onValueChange={handleModelChange}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4"
            >
              {options.MODELS.map((model, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={model}
                    id={`model-${index}`}
                    className="peer aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Label
                    htmlFor={`model-${index}`}
                    className={cn(
                        "flex items-center justify-center p-2 sm:p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 w-full text-xs sm:text-sm",
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
        <Label htmlFor="text" className="flex items-center gap-2 text-sm sm:text-base">
          <LuMail /> Mensagem
        </Label>
        <Input
          id="text"
          name="text"
          value={formData.text}
          maxLength={options.MAX_TEXT_LENGTH || 200}
          onChange={handleInputChange}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="flex items-center gap-2 text-sm sm:text-base">
          <LuZap /> Quantidade de satoshis
        </Label>

        <Input
          id="amount"
          name="amount"
          type="number"
          min={options.MIN_SATOSHI_QNT}
          value={formData.amount}
          onChange={handleInputChange}
          required
          className="w-full"
        />

        <p className="text-xs sm:text-sm text-right text-card-foreground/75">
          Quantidade mínima:{" "}
          <span className="font-bold">{options.MIN_SATOSHI_QNT} sats</span>
        </p>
      </div>

      <Button
        type="submit"
        className="text-center w-full text-sm sm:text-base py-2 sm:py-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            {"Criando invoice..."}
            <LuLoader className="animate-spin ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </>
        ) : (
          <>
            {"Continuar"}
            <LuArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </>
        )}
      </Button>
    </form>
  );
}
