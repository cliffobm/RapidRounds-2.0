// Presentation-only cleanup retains historical case definitions and answer hashes.
// Simulation scope remains in case information and review notes.
const teachingSentences = [
  'This is a scripted teaching update, not a prediction of treatment response.',
  'This is a scripted update, not a prediction of treatment response.',
  'This is the guided story’s next stage, rather than a prediction of treatment response.',
]
export function clinicalNarrative(value: string) {
  return teachingSentences
    .reduce((text, sentence) => text.replace(sentence, ''), value)
    .replace(/\s{2,}/g, ' ')
    .trim()
}
