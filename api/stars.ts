import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (will reset on cold starts)
// For persistent storage, use Vercel KV, Supabase, or other database
let stars: any[] = [
  {
    id: 'init-1',
    originalText: "I am thankful for my healthy family",
    aiResponse: {
      category: "Family",
      sentimentColor: "#FFD700",
      blessing: "Family is the root that anchors us in the storm of life; cherish their warmth.",
      brightness: 0.9,
      archetype: "The Guardian",
      distance: "12 Light Years",
      frequency: "432 Hz"
    }
  },
  {
    id: 'init-2',
    originalText: "Grateful for the warm coffee this morning",
    aiResponse: {
      category: "Small Joys",
      sentimentColor: "#e67e22",
      blessing: "In the smallest sips, we taste the vast comfort of the universe.",
      brightness: 0.6,
      archetype: "The Observer",
      distance: "0.01 Light Years",
      frequency: "528 Hz"
    }
  },
  {
    id: 'init-3',
    originalText: "Thankful for the code that runs without errors",
    aiResponse: {
      category: "Career",
      sentimentColor: "#2ecc71",
      blessing: "Order from chaos is a divine act; may your logic always flow clear.",
      brightness: 0.8,
      archetype: "The Architect",
      distance: "10101 Light Years",
      frequency: "60 Hz"
    }
  }
];

// Keep only the last 100 stars to prevent memory issues
const MAX_STARS = 100;

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ stars });
  }

  if (req.method === 'POST') {
    try {
      const newStar = req.body;
      if (newStar && newStar.id && newStar.originalText && newStar.aiResponse) {
        stars.push(newStar);
        // Keep only the last MAX_STARS
        if (stars.length > MAX_STARS) {
          stars = stars.slice(-MAX_STARS);
        }
        return res.status(201).json({ success: true, star: newStar });
      }
      return res.status(400).json({ error: 'Invalid star data' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add star' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
