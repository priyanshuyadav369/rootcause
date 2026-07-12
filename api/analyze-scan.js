// POST /api/analyze-scan
// Body: { imageBase64: string (no data: prefix), mimeType: string, scanType: 'leaf' | 'root', plantName: string, species?: string }
// Returns: { detected_issue, severity, ai_diagnosis, recommended_action, tags }
//
// Two Groq calls on purpose:
//   1. Groq Vision  -> reads the photo, describes visible symptoms only
//   2. Groq (text)  -> turns that description into a structured diagnosis + treatment
//
// NOTE: Groq's available model names change over time. Check
// https://console.groq.com/docs/models for current vision + text model IDs
// and update the defaults below (or set GROQ_VISION_MODEL / GROQ_TEXT_MODEL
// in your environment) if a model name has been deprecated.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview'
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageBase64, mimeType, scanType, plantName, species } = req.body || {}

  if (!imageBase64 || !mimeType || !scanType) {
    return res.status(400).json({ error: 'imageBase64, mimeType, and scanType are required' })
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' })
  }

  try {
    // ---------- Step 1: Groq Vision reads the photo ----------
    const visionResp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
    const raw = diagnosisData.choices?.[0]?.message?.content

    let diagnosis
    try {
      diagnosis = JSON.parse(raw)
    } catch {
      throw new Error('Could not parse diagnosis JSON from Groq')
    }

    return res.status(200).json({
      detected_issue: diagnosis.detected_issue,
      severity: diagnosis.severity,
      ai_diagnosis: diagnosis.ai_diagnosis,
      recommended_action: diagnosis.recommended_action,
      tags: diagnosis.tags || [],
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Scan analysis failed' })
  }
}
