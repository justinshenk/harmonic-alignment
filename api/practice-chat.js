// Vercel Function: POST /api/practice-chat
// Recommends practices from the loaded traditions dataset using the Vercel AI Gateway.
//
// Request body:  { message: string, traditionPreference?: 'secular'|'spiritual', traditions: Array<{id,name,practices}> }
// Response body: { response: "<JSON string>" }  -- frontend JSON.parses it
//                { error: "..." }                -- on failure
//
// The response.response string follows the schema enforced below by Zod, so the
// frontend's JSON.parse(data.response) and renderChatRecommendations() never see
// malformed JSON from the model.
//
// Replaces the cross-origin POST to https://www.justinshenk.com/api/practice-chat.

const { generateObject } = require('ai');
const { z } = require('zod');

const recommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        practice: z.string().describe('Practice name'),
        traditionId: z.string().describe('Exact id of the tradition from the provided list'),
        traditionName: z.string().describe('Display name of the tradition'),
        why: z.string().describe('One sentence why it fits the user'),
        tryNow: z.string().describe('A short concrete instruction the user can do in the next minute')
      })
    )
    .min(1)
    .max(2),
  note: z.string().optional()
});

// ---------- Airtable logging (fire-and-forget, no IP for GDPR) ----------
async function logToAirtable({ message, traditionPreference, origin, response }) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!baseId || !apiKey) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/PracticeChat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Message: (message || '').slice(0, 1000),
              TraditionPreference: traditionPreference || '',
              Origin: origin || '',
              Response: (response || '').slice(0, 2000),
              Timestamp: new Date().toISOString()
            }
          }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown');
      console.error(`[Airtable] ${res.status}: ${body}`);
    }
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.warn('[Airtable] timeout');
    } else {
      console.error('[Airtable] error:', err);
    }
  }
}

// ---------- Rate limiting (in-memory, per Fluid Compute instance) ----------
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function buildSystemPrompt(traditions) {
  const list = traditions
    .map(t => `- ${t.name} (id: ${t.id}): ${(t.practices || []).slice(0, 4).join(', ')}`)
    .join('\n');
  return `You recommend specific practices from contemplative, therapeutic, and somatic traditions.

Recommend 1–2 practices that match the user's stated need. Be concise and concrete.
Use only the traditions listed below, and use their exact ids in traditionId.

AVAILABLE TRADITIONS:
${list}`;
}

// ---------- Handler ----------
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const { message, traditionPreference, traditions } = req.body || {};
    const origin = req.headers.origin || null;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    console.log(
      '[practice-chat]',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        origin,
        message: message.slice(0, 500),
        traditionPreference
      })
    );

    // AI Gateway auth: VERCEL_OIDC_TOKEN is injected automatically on every
    // Vercel deployment, so no env-var check is needed here. If the gateway
    // is not enabled on the project, generateObject below throws and the
    // catch returns 500; the frontend renders that as the soft-fail message.

    const fallbackTraditions = [
      { id: 'mbsr', name: 'MBSR', practices: ['Body scan', 'Breathing space'] }
    ];
    const list = Array.isArray(traditions) && traditions.length ? traditions : fallbackTraditions;

    let userMessage = message;
    if (traditionPreference === 'secular') {
      userMessage += '\n\n[User prefers secular, evidence-based practices. Avoid religious traditions.]';
    } else if (traditionPreference === 'spiritual') {
      userMessage += '\n\n[User is open to spiritual but not strictly religious practices.]';
    }

    const { object } = await generateObject({
      // Plain "provider/model" string routes through the Vercel AI Gateway.
      // Haiku is cheap, fast, and strong at structured JSON for this size of task.
      model: 'anthropic/claude-haiku-4.5',
      schema: recommendationSchema,
      system: buildSystemPrompt(list),
      prompt: userMessage,
      temperature: 0.7
    });

    const responseString = JSON.stringify(object);

    // Fire-and-forget logging
    logToAirtable({ message, traditionPreference, origin, response: responseString });

    res.status(200).json({ response: responseString });
  } catch (err) {
    console.error('Practice chat error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};
