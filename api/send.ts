import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req:VercelRequest, res:VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, bride_name, groom_name, budget, weeding_type, additional_info } = req.body;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY in environment variables' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        to: 'lu97is@gmail.com',
        from: 'onboarding@resend.dev',
        subject: 'Wedding Planner Form Submission',
        html: `
          <h1>Wedding Planner Form Submission</h1>
          <p>New form submission from ${bride_name} and ${groom_name}:</p>
          <p><strong>Bride name:</strong> ${bride_name}</p>
          <p><strong>Groom name:</strong> ${groom_name}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          <p><strong>Wedding2 type:</strong> ${weeding_type}</p>
          <p><strong>Additional info:</strong> ${additional_info}</p>
        `,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } else {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
}
