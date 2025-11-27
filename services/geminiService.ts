import { GoogleGenAI, Type } from "@google/genai";
import { StarData } from "../types";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Safely access API key
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.API_KEY;
  }
  return undefined;
};

export const analyzeGratitude = async (text: string): Promise<StarData> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this user's gratitude statement for Thanksgiving: "${text}".
    
    You are a "Cosmic Spirit". Turn this gratitude into a unique celestial body.
    
    1. 'category': Thematically group it (e.g., Roots, Spark, Flow, Harmony, Vitality).
    2. 'sentimentColor': A Hex code representing the aura.
    3. 'blessing': A poetic, philosophical whisper (1-2 sentences) in the same language as input.
    4. 'brightness': 0.5 to 1.0 based on emotional depth.
    5. 'archetype': Assign a cool role title (e.g., The Healer, The Navigator, The Weaver, The Stargazer).
    6. 'distance': Invent a distance from Earth (e.g., "800 Light Years", "In the Heart Nebula").
    7. 'frequency': Invent a resonant frequency (e.g., "528 Hz", "Om Resonance").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            sentimentColor: { type: Type.STRING },
            blessing: { type: Type.STRING },
            brightness: { type: Type.NUMBER },
            archetype: { type: Type.STRING },
            distance: { type: Type.STRING },
            frequency: { type: Type.STRING },
          },
          required: ["category", "sentimentColor", "blessing", "brightness", "archetype", "distance", "frequency"],
        },
      },
    });

    const data = JSON.parse(response.text);

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
    console.error("Gemini API Error:", error);
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