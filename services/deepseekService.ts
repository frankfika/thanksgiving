import { StarData } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

// Check if we're in production (Vercel) or local development
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use relative URL (works for both local and production)
    return '/api/analyze';
  }
  return '/api/analyze';
};

export const hasValidApiKey = (): boolean => {
  // In production, the API key is on the server side
  // We assume it's configured if we're deployed
  return true;
};

export const analyzeGratitude = async (text: string): Promise<StarData> => {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const { star } = await response.json();
    return star;
  } catch (error) {
    console.error("API Error:", error);

    // Fallback star when API fails
    return {
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
  }
};
