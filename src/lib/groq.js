// Direct client-side calls to Groq — no backend involved, same approach as
// the reference project's src/api/ai.js. The Groq key is a VITE_ variable,
// which means it ships inside the browser bundle. That's a real trade-off
// (anyone could technically read it out of your deployed site's JS), but it
// matches what was taught for this assignment. If you ever wanted the more
// locked-down version, api/analyze-scan.js style Vercel functions are the
// fix — just not required here.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// As of July 2026: llama-3.2-11b-vision-preview, llama-3.3-70b-versatile, and
// meta-llama/llama-4-scout-17b-16e-instruct are all deprecated or scheduled
// for imminent shutdown by Groq. These two are current and not on any
// deprecation notice — but Groq's lineup changes over time, so if either
// ever starts erroring with "model_decommissioned", check
// https://console.groq.com/docs/deprecations for the current replacement
// and update here (or set VITE_GROQ_VISION_MODEL / VITE_GROQ_TEXT_MODEL).
const VISION_MODEL = import.meta.env.VITE_GROQ_VISION_MODEL || 'qwen/qwen3.6-27b'
const TEXT_MODEL = import.meta.env.VITE_GROQ_TEXT_MODEL || 'openai/gpt-oss-120b'

/**
 * Two-step diagnosis: Groq Vision reads the photo for visible symptoms,
 * then Groq (text) turns that into a structured diagnosis + treatment.
 */
export async function analyzeScan({ imageBase64, mimeType, scanType, plantName, species }) {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set — add it to your .env file.')
  }

  // ---------- Step 1: Groq Vision reads the photo ----------
  const visionResp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are looking at a photo of a plant ${scanType} (${plantName}${species ? `, ${species}` : ''}). Describe only what you visually observe: color, spotting, wilting, texture, any pests, any root damage. Do not diagnose yet, just describe the visible symptoms in 3-5 sentences.`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    }),
  })

  if (!visionResp.ok) {
    const text = await visionResp.text()
    throw new Error(`Groq Vision error (${visionResp.status}): ${text}`)
  }

  const visionData = await visionResp.json()
  const symptomDescription = visionData.choices?.[0]?.message?.content?.trim()

  if (!symptomDescription) {
    throw new Error('Groq Vision returned no description')
  }

  // ---------- Step 2: Groq (text) turns the description into a diagnosis ----------
  const diagnosisResp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a home-gardening assistant for beginners growing plants on terraces and balconies in India. Given a description of visible symptoms, respond with ONLY a JSON object with these exact keys: ' +
            '"detected_issue" (short phrase, e.g. "Nitrogen deficiency"), ' +
            '"severity" ("low", "medium", or "high"), ' +
            '"ai_diagnosis" (2-3 plain-language sentences explaining the likely cause), ' +
            '"recommended_action" (1-2 sentences with a specific, concrete fix — name an actual mineral, fertilizer, or treatment and roughly how to apply it), ' +
            '"tags" (an array of 1-4 short lowercase-hyphenated keywords describing the issue, e.g. ["nitrogen-deficiency","yellowing"]).',
        },
        {
          role: 'user',
          content: `Plant: ${plantName}${species ? ` (${species})` : ''}\nPart photographed: ${scanType}\nVisible symptoms: ${symptomDescription}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  })

  if (!diagnosisResp.ok) {
    const text = await diagnosisResp.text()
    throw new Error(`Groq diagnosis error (${diagnosisResp.status}): ${text}`)
  }

  const diagnosisData = await diagnosisResp.json()
  const raw = diagnosisData.choices?.[0]?.message?.content || '{}'

  // models don't always return perfectly bare JSON even when asked to —
  // pull out the first {...} block rather than assuming the whole string
  // is valid JSON on its own
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  let diagnosis
  try {
    diagnosis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    throw new Error('Could not parse diagnosis JSON from Groq')
  }

  return {
    detected_issue: diagnosis.detected_issue || 'Unable to determine',
    severity: ['low', 'medium', 'high'].includes(diagnosis.severity) ? diagnosis.severity : 'medium',
    ai_diagnosis: diagnosis.ai_diagnosis || symptomDescription,
    recommended_action: diagnosis.recommended_action || 'Consult a local nursery for guidance.',
    tags: Array.isArray(diagnosis.tags) ? diagnosis.tags : [],
  }
}

/**
 * Ask AI — answers a question grounded only in the context object passed in
 * (the caller fetches the user's own plants/scans first, via Supabase).
 */
export async function askAI(question, context) {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set — add it to your .env file.')
  }

  const contextSummary = JSON.stringify(context || {}, null, 2)

  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly gardening assistant inside RootCause, an app for terrace/balcony gardeners. ' +
            'Answer the user\'s question using ONLY the plant and scan data provided below as context. ' +
            'If the data does not contain enough information to answer, say so plainly rather than guessing. ' +
            'Keep answers to 2-4 sentences, plain language, no markdown headers.\n\n' +
            `USER DATA:\n${contextSummary}`,
        },
        { role: 'user', content: question },
      ],
      temperature: 0.4,
      max_tokens: 400,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Groq error (${resp.status}): ${text}`)
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content?.trim() || "I couldn't generate an answer for that."
}
