// Production equivalent of the Vite dev-server proxy in vite.config.js.
// The browser POSTs a complete Resend email payload here; this just relays
// it to Resend with the secret key attached server-side.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  })

  const data = await response.json()
  return res.status(response.status).json(data)
}
