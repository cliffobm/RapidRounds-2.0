'use client'
import React from "react";
import manifest from "@/qbank/bank.manifest.json";

type Props = { value?: string; onChange: (key: string) => void; label?: string };

export default function BankSelector({ value, onChange, label = "Select bank" }: Props) {
  const banks = (manifest as any).banks as Array<{ key: string; title: string; items: number }>;
  return (
    <label style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 280 }}
        aria-label={label}
      >
        <option value="" disabled>Choose a topic…</option>
        {banks.map(b => (
          <option key={b.key} value={b.key}>
            {b.title} {typeof b.items === "number" ? `(${b.items})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
