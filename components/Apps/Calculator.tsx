"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

type Op = "+" | "-" | "×" | "÷" | null;

function applyOp(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

const BUTTONS: { label: string; kind: "digit" | "op" | "action" }[] = [
  { label: "AC", kind: "action" },
  { label: "±", kind: "action" },
  { label: "%", kind: "action" },
  { label: "÷", kind: "op" },
  { label: "7", kind: "digit" },
  { label: "8", kind: "digit" },
  { label: "9", kind: "digit" },
  { label: "×", kind: "op" },
  { label: "4", kind: "digit" },
  { label: "5", kind: "digit" },
  { label: "6", kind: "digit" },
  { label: "-", kind: "op" },
  { label: "1", kind: "digit" },
  { label: "2", kind: "digit" },
  { label: "3", kind: "digit" },
  { label: "+", kind: "op" },
  { label: "0", kind: "digit" },
  { label: ".", kind: "digit" },
  { label: "=", kind: "op" },
];

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op>(null);
  const [freshEntry, setFreshEntry] = useState(true);

  const handleDigit = (d: string) => {
    if (d === "." && display.includes(".")) return;
    if (freshEntry || display === "0") {
      setDisplay(d === "." ? "0." : d);
      setFreshEntry(false);
    } else {
      setDisplay((prev) => prev + d);
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (op === "AC") {
      setDisplay("0");
      setStored(null);
      setPendingOp(null);
      setFreshEntry(true);
      return;
    }
    if (op === "±") {
      setDisplay((current * -1).toString());
      return;
    }
    if (op === "%") {
      setDisplay((current / 100).toString());
      return;
    }
    if (op === "=") {
      const result = stored === null ? current : applyOp(stored, current, pendingOp);
      setDisplay(Number.isFinite(result) ? trimNumber(result) : "Error");
      setStored(null);
      setPendingOp(null);
      setFreshEntry(true);
      return;
    }
    // +, -, ×, ÷
    setStored((prevStored) => (prevStored === null ? current : applyOp(prevStored, current, pendingOp)));
    setPendingOp(op as Op);
    setFreshEntry(true);
  };

  const onPress = (label: string, kind: string) => {
    if (kind === "digit") handleDigit(label);
    else handleOp(label);
  };

  return (
    <div className="flex h-full flex-col justify-end bg-black/20 p-4">
      <div className="mb-4 flex-1 flex items-end justify-end px-2">
        <p className="truncate text-right text-5xl font-light tabular-nums">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.map(({ label, kind }) => (
          <button
            key={label}
            onClick={() => onPress(label, kind)}
            className={cn(
              "flex h-14 items-center justify-center rounded-2xl text-lg font-medium transition active:scale-95",
              kind === "digit" && "bg-white/10 hover:bg-white/15",
              kind === "action" && "bg-white/20 hover:bg-white/25 text-white/90",
              kind === "op" && "bg-aurora text-white hover:brightness-110",
              label === "0" && "col-span-2 justify-start pl-6"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function trimNumber(n: number): string {
  return parseFloat(n.toFixed(8)).toString();
}
