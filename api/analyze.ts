import type { VercelRequest, VercelResponse } from '@vercel/node';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support multiple possible env var names, trim whitespace
  const rawKey = process.env.DEEPSEEK_KEY || process.env.DEEPSEEK_API_KEY || process.env.DEEP_SEEK_KEY;
  if (!rawKey) {
    console.error('DeepSeek API key not found. Checked: DEEPSEEK_KEY, DEEPSEEK_API_KEY, DEEP_SEEK_KEY');
    return res.status(500).json({ error: 'API key not configured' });
  }
  const apiKey = rawKey.trim();

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }

  const prompt = `
    Analyze this user's gratitude statement for Thanksgiving: "${text}".

    You are a "Cosmic Spirit". Turn this gratitude into a unique celestial body.

    Return a JSON object with these fields:
    1. 'category': Thematically group it (e.g., Roots, Spark, Flow, Harmony, Vitality).
    2. 'sentimentColor': A Hex code representing the aura (e.g., "#FFD700").
    3. 'blessing': A poetic, philosophical whisper (1-2 sentences) in the same language as input.
    4. 'brightness': A number between 0.5 to 1.0 based on emotional depth.
    5. 'archetype': Assign a cool role title (e.g., The Healer, The Navigator, The Weaver, The Stargazer).
    6. 'distance': Invent a distance from Earth (e.g., "800 Light Years", "In the Heart Nebula").
    7. 'frequency': Invent a resonant frequency (e.g., "528 Hz", "Om Resonance").

    Return ONLY the JSON object, no markdown formatting.
  `;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a cosmic spirit that transforms gratitude into celestial descriptions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'DeepSeek API request failed' });
    }

    const result = await response.json();
    const data = JSON.parse(result.choices[0].message.content);

    const star = {
      id: generateId(),
      originalText: text,
      aiResponse: {
        category: data.category,
        sentimentColor: data.sentimentColor,
        blessing: data.blessing,
        brightness: data.brightness,
        archetype: data.archetype,
        distance: data.distance,
        frequency: data.frequency,
      },
    };

    return res.status(200).json({ star });
  } catch (error) {
    console.error('Error calling DeepSeek:', error);

    // Return a fallback star on error
    const fallbackStar = {
      id: generateId(),
      originalText: text,
      aiResponse: {
        category: "Echo",
        sentimentColor: "#ffffff",
        blessing: "Your gratitude echoes in the silence of the cosmos.",
        brightness: 0.5,
        archetype: "The Traveler",
        distance: "Unknown",
        frequency: "Silence"
      },
    };

    return res.status(200).json({ star: fallbackStar });
  }
}
