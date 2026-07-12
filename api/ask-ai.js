// POST /api/ask-ai
// Body: { question: string, context: { plants: [...], scans: [...] } }
// Returns: { answer: string }
//
// The frontend fetches the user's own plants/scans via the Supabase client
// (RLS already scopes it to them) and sends a summary here, so this endpoint
// never touches the database directly — it just reasons over what it's given.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question, context } = req.body || {}

  if (!question) {
    return res.status(400).json({ error: 'question is required' })
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' })
  }

  try {
    const contextSummary = JSON.stringify(context || {}, null, 2)

    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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
    const answer = data.choices?.[0]?.message?.content?.trim()

    return res.status(200).json({ answer: answer || "I couldn't generate an answer for that." })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Ask AI failed' })
  }
}
