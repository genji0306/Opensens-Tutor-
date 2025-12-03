import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLessonContent = async (
  topic: string,
  age: number,
  subject: string,
  tone: string
): Promise<LessonPlan> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings.");
  }

  const prompt = `Create a short, engaging lesson plan for a ${age}-year-old student about "${topic}" in the subject of ${subject}. The tone should be ${tone}.
  Provide:
  1. A fun explanation of the topic (max 150 words).
  2. A mini quiz with 3 multiple choice questions.
  `;

  // Define schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      content: { type: Type.STRING, description: "The lesson explanation text" },
      quizQuestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" }
          }
        }
      }
    },
    required: ["content", "quizQuestions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Generate a placeholder image or use AI to generate one if enabled
    // For this demo, we will try to generate an image using Gemini if the key supports it, otherwise fallback
    let imageUrl = `https://picsum.photos/400/300?seed=${encodeURIComponent(topic)}`;

    try {
        // Attempt to generate a header image for the lesson
        // Using gemini-2.5-flash-image which is generally available
        const imagePrompt = `A child-friendly, colorful illustration for a lesson about ${topic}. Cartoon style.`;
        const imageResp = await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: imagePrompt,
             config: {
                 // No responseMimeType for image models usually, but we need to check constraints
             }
        });
        
        // Search for inline data
        for (const part of imageResp.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                 break;
             }
        }
    } catch (e) {
        console.warn("Image generation failed, falling back to placeholder", e);
    }

    return {
      id: Date.now().toString(),
      topic,
      content: data.content,
      quizQuestions: data.quizQuestions,
      imageUrl,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const chatWithTutorPreview = async (
  systemInstruction: string,
  message: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<string> => {
   if (!apiKey) return "Error: API Key missing.";

   try {
     const chat = ai.chats.create({
       model: 'gemini-2.5-flash',
       history: history,
       config: {
         systemInstruction: systemInstruction,
       }
     });

     const response = await chat.sendMessage({ message });
     return response.text || "I'm having trouble thinking right now.";
   } catch (error) {
     console.error("Chat Error:", error);
     return "Error connecting to Tutor Brain.";
   }
};