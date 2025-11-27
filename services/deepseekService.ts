import { StarData } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.DEEPSEEK_KEY;
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  return undefined;
};

export const hasValidApiKey = (): boolean => {
  return !!getApiKey();
};

export const analyzeGratitude = async (text: string): Promise<StarData> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing");
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
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const data = JSON.parse(result.choices[0].message.content);

    return {
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
  } catch (error) {
    console.error("DeepSeek API Error:", error);
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
