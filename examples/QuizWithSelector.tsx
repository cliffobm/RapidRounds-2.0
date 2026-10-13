'use client'
import React, { useMemo, useState } from "react";
import { BANKS, BankKey } from "@/qbank/banks";
import BankSelector from "@/components/BankSelector";
import { useScenarioDrill } from "@/packages/adaptive-drill/src/useScenarioDrill";
import { shuffleOptions } from "@/packages/adaptive-drill/src/utils/shuffleOptions";
import { useSwipe } from "@/packages/adaptive-drill/src/utils/useSwipe";
import { useBookmarks } from "@/packages/adaptive-drill/src/utils/useBookmarks";

export default function QuizWithSelector() {
  const [bankKey, setBankKey] = useState<BankKey | "">("");
  const bank = bankKey ? BANKS[bankKey] : null;

  return (
    <div style={{ maxWidth: 820, margin: "2rem auto", fontFamily: "system-ui" }}>
      <div style={{ marginBottom: 16 }}>
        <BankSelector value={bankKey} onChange={(k) => setBankKey(k as BankKey)} />
      </div>
      {bank ? <Drill key={bankKey} bank={bank} /> : <p>Select a bank to start drilling.</p>}
    </div>
  );
}

function Drill({ bank }: { bank: any }) {
  const { card, submit, next, progress } = useScenarioDrill({ bank, sessionCap: 12 });
  const { toggleBookmark } = useBookmarks();

  const [seedMap] = useState<Record<string, number>>({});
  const shuffled = useMemo(() => {
    if (!card) return undefined;
    const id = card.id ?? `${Math.random()}`;
    if (!seedMap[id]) seedMap[id] = Math.floor(Math.random() * 1e9);
    const rng = mulberry32(seedMap[id]);
    return shuffleOptions(card, rng);
  }, [card, seedMap]);

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: next,
    onSwipeRight: () => card && toggleBookmark(card.id),
  });

  if (!shuffled) return <div>No due cards. Queue: {String(progress.queue)}</div>;

  return (
    <main ref={swipeRef} style={{ touchAction: "pan-y", userSelect: "none" }} aria-label="Quiz card">
      <h2>{shuffled.topic}</h2>
      {shuffled.stem && <p>{shuffled.stem}</p>}
      <p>{shuffled.question}</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {shuffled.options.map((opt: string, i: number) => {
          const letter = String.fromCharCode(65 + i);
          return (
            <li key={i} style={{ marginBottom: 8 }}>
              <button onClick={() => submit(letter === shuffled.correct_answer ? "correct" : "incorrect")}>
                <strong>{letter}.</strong> {opt}
              </button>
            </li>
          );
        })}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={next} disabled={progress.queue <= 1}>Next</button>
        <small style={{ opacity: 0.7 }}>
          <span role="img" aria-label="swipe">👆</span> Swipe left → Next • Swipe right → Bookmark
        </small>
      </div>
    </main>
  );
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
