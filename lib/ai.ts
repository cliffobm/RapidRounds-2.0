// lib/ai.ts
import 'server-only'

// Factory functions - no module-level caching to avoid build-time issues

export function getOpenAI() {
  // Defer requiring the OpenAI SDK until runtime
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error('Missing OPENAI_API_KEY')
  }
  // Use dynamic require to avoid build-time evaluation
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const OpenAI = require('openai')
  return new OpenAI({ apiKey: key })
}

// Rationale generation function
export async function generateRationale(input: { prompt: string }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  const systemPrompt = `You are a medical education expert. Generate a concise, evidence-based rationale for the question.
  Use:
  1) Correct answer explanation
  2) Key clinical reasoning
  3) Alternatives and why not
  4) Takeaways`

  async function tryOnce(model: string) {
    const openai = getOpenAI()
    return openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.prompt },
      ],
      max_tokens: 800,
      temperature: 0.5,
      signal: controller.signal,
    })
  }

  try {
    // Simple retry/backoff across models
    const models = [
      'gpt-4o-mini',
      'gpt-4o-mini-2024-07-18',
      'gpt-4o',
    ]

    let lastError: any = null
    for (const model of models) {
      try {
        const response = await tryOnce(model)
        clearTimeout(timeout)
        return {
          ok: true,
          data: {
            rationale: response.choices[0]?.message?.content || 'Unable to generate rationale',
            model,
            usage: response.usage,
          },
        }
      } catch (err: any) {
        lastError = err
      }
    }

    // Fallback content if all attempts fail
    console.error('OpenAI API error (all retries failed):', lastError)
    clearTimeout(timeout)
    return {
      ok: false,
      error: 'AI service unavailable. Please try again shortly.',
      data: {
        rationale: 'Rationale temporarily unavailable due to connectivity. Consider ABCs, most time-sensitive risks, guideline-first therapies, and contraindications.',
        model: 'fallback',
        usage: undefined,
      } as any,
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    clearTimeout(timeout)
    return {
      ok: false,
      error: error?.message || 'Failed to generate rationale',
    }
  }
}
