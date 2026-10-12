'use client'
import React, { useMemo, useState } from "react";
import scenarios from "../qbank/banks/scenario_vignettes.testbank.json";
import { useScenarioDrill } from "../packages/adaptive-drill/src/useScenarioDrill";
import { shuffleOptions } from "../packages/adaptive-drill/src/utils/shuffleOptions";
import { missRatesByTopic } from "../packages/adaptive-drill/src/utils/analytics";

export default function AccessibleQuiz() {
  const { card, submit, next, progress, internal } = useScenarioDrill({ bank: scenarios, sessionCap: 12 });

  const [seedMap] = useState<Record<string, number>>({});
  const shuffled = useMemo(() => {
    if (!card) return undefined;
    if (!seedMap[card.id]) seedMap[card.id] = Math.floor(Math.random() * 1e9);
    const rng = mulberry32(seedMap[card.id]);
    return shuffleOptions(card, rng);
  }, [card, seedMap]);

  if (!shuffled) return <div>No due cards. Queue: {progress.queue}</div>;

  const analytics = missRatesByTopic(internal);

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div aria-live="polite" style={{ opacity: 0.7, fontSize: 12 }}>
          Queue: {progress.queue} • Seen: {progress.seen} • ✅ {progress.correct} • ❌ {progress.incorrect}
        </div>
        <small>Hardest: {analytics.slice(0,3).map(a => `${a.topic} (${Math.round(a.missRate*100)}%)`).join(", ") || "—"}</small>
      </header>

      <h2 style={{ margin: "0.5rem 0" }}>{shuffled.topic}</h2>
      {shuffled.stem && <p>{shuffled.stem}</p>}
      {renderAssets(shuffled.assets)}

      <fieldset role="group" aria-labelledby="question-label" style={{ border: 0, padding: 0 }}>
        <legend id="question-label" className="sr-only">Question</legend>
        <p>{shuffled.question}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {shuffled.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <li key={i} style={{ marginBottom: 8 }}>
                <button
                  aria-label={`Answer ${letter}`}
                  onClick={() => submit(letter === shuffled.correct_answer ? "correct" : "incorrect")}
                  style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", width: "100%" }}
                >
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{letter}.</span>{opt}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div style={{ marginTop: 10 }}>
        <button onClick={next} aria-label="Skip this question" style={{ fontSize: 12, textDecoration: "underline" }}>Skip</button>
      </div>
    </div>
  );
}

function renderAssets(assets?: Record<string,string>) {
  if (!assets) return null;
  const keys = Object.keys(assets);
  if (!keys.length) return null;
  const first = assets[keys[0]];
  if (typeof first === "string" && /\.(png|jpg|jpeg|gif|webp)$/i.test(first)) {
    return <img src={first} alt="Case asset" style={{ maxWidth: "100%", borderRadius: 8, margin: "8px 0" }} />;
  }
  return null;
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
