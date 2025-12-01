import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import { AIResponse } from '../types';

// Safe access to process.env
const env = typeof process !== 'undefined' ? process.env : {};
const apiKey = env.API_KEY || '';

const enhanceTaskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    improvedTitle: { type: Type.STRING, description: "A concise, action-oriented title for the task." },
    improvedDescription: { type: Type.STRING, description: "A professional, detailed description of the task using agile user story format if applicable." },
    acceptanceCriteria: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "A list of 3-5 clear acceptance criteria."
    },
    suggestedTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-4 relevant short tags (e.g., 'Frontend', 'Bug', 'Optimization')."
    },
    estimatedStoryPoints: {
      type: Type.INTEGER,
      description: "Fibonacci number estimation (1, 2, 3, 5, 8, 13) based on complexity."
    }
  },
  required: ["improvedTitle", "improvedDescription", "acceptanceCriteria", "suggestedTags", "estimatedStoryPoints"]
};

export const enhanceTaskWithAI = async (title: string, description: string): Promise<AIResponse> => {
  try {
    // Initialize client here to avoid module-level crashes if API key is missing/invalid on load
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert Agile Product Manager. Please analyze the following task draft and enhance it.
      
      Current Title: "${title}"
      Current Description: "${description}"
      
      Provide a more professional title, a structured description (User Story format), acceptance criteria, relevant tags, and story point estimation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: enhanceTaskSchema,
        systemInstruction: "You are a helpful assistant that improves Jira tickets. Be concise but thorough.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("AI Enhancement failed:", error);
    throw error;
  }
};