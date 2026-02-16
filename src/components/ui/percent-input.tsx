"use client";

import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

interface PercentInputProps extends Omit<NumericFormatProps, "onValueChange"> {
  onValueChange: (value: number | undefined) => void;
  value: number | undefined | null;
}

export function PercentInput({ value, onValueChange, className, ...props }: PercentInputProps) {
  return (
    <NumericFormat
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      suffix="%" // O diferencial aqui
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      customInput={Input}
      onValueChange={(values) => {
        onValueChange(values.floatValue);
      }}
      className={className}
      {...props}
    />
  );
}