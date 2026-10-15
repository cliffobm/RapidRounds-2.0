'use client'
import React, { useMemo, useState } from "react";
import { BANKS, BankKey } from "@/qbank/banks";
import BankSelector from "@/components/BankSelector";
import { useBookmarks } from "@/packages/adaptive-drill/src/utils/useBookmarks";

export default function ReviewBookmarkedFlagged() {
  const [bankKey, setBankKey] = useState<BankKey | "">("");
  const bank = bankKey ? BANKS[bankKey] : null;
  const { bookmarks, flags } = useBookmarks();
  const [mode, setMode] = useState<"bookmarks" | "flags">("bookmarks");

  const ids = useMemo(() => (mode === "bookmarks" ? bookmarks : flags), [mode, bookmarks, flags]);

  const items = useMemo(() => {
    if (!bank) return [];
    const set = new Set(Array.from(ids.values()));
    return (bank.items || []).filter((it: any) => set.has(it.id));
  }, [bank, ids]);

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <BankSelector value={bankKey} onChange={(k) => setBankKey(k as BankKey)} label="Review in bank" />
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="radio" name="mode" checked={mode === "bookmarks"} onChange={() => setMode("bookmarks")} />
          Bookmarked
        </label>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="radio" name="mode" checked={mode === "flags"} onChange={() => setMode("flags")} />
          Flagged
        </label>
      </div>

      {!bank ? <p>Select a bank to review.</p> :
        items.length === 0 ? <p>No {mode} in this bank yet.</p> :
        <ol>
          {items.map((it: any) => (
            <li key={it.id} style={{ marginBottom: 12 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{it.topic}</div>
                {it.stem && <p style={{ margin: "4px 0" }}>{it.stem}</p>}
                <p style={{ margin: "6px 0" }}><strong>Q:</strong> {it.question}</p>
                <ul style={{ margin: "4px 0 0 1rem" }}>
                  {it.options.map((opt: string, i: number) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = letter === it.correct_answer;
                    return <li key={i} style={{ fontWeight: isCorrect ? 600 : 400 }}>{letter}. {opt}</li>;
                  })}
                </ul>
                {it.rationale && <p style={{ marginTop: 6 }}><em>Rationale:</em> {it.rationale}</p>}
                {it.clinical_pearl && <p style={{ marginTop: 4 }}><em>Pearl:</em> {it.clinical_pearl}</p>}
              </div>
            </li>
          ))}
        </ol>
      }
    </div>
  );
}


