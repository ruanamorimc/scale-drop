"use client";

import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input"; // Importamos o Input base do Shadcn

// O componente aceita todas as props normais, mais a nossa "onValueChange" simplificada
interface CurrencyInputProps extends Omit<NumericFormatProps, "onValueChange"> {
  onValueChange: (value: number | undefined) => void;
  value: number | undefined | null;
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2} // Sempre 2 casas decimais
      fixedDecimalScale // Força aparecer ,00 mesmo se for redondo
      allowNegative={false} // Não permite valor negativo
      customInput={Input} // 🔥 AQUI É O SEGREDO: Usamos o Input do Shadcn como base visual
      onValueChange={(values) => {
        // values.floatValue é o número puro (ex: 1234.56) ou undefined se estiver vazio
        onValueChange(values.floatValue);
      }}
      // Repassa as classes do Tailwind para o Input do Shadcn
      className={className} 
      {...props}
    />
  );
}