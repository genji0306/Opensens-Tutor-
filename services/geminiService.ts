import { GoogleGenAI, Type, LiveServerMessage, Modality, Blob } from "@google/genai";
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

/**
 * LiveSession handles the WebSocket connection for the Gemini Live API.
 * It manages audio input (microphone), audio output (speakers), and the session lifecycle.
 */
export class LiveSession {
    private client: GoogleGenAI;
    private config: any;
    private sessionPromise: Promise<any> | null = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputNode: MediaStreamAudioSourceNode | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private outputNode: AudioNode | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    private onStatusChange: (status: 'connected' | 'disconnected' | 'error' | 'speaking') => void;
    private systemInstruction: string;
    private voiceName: string;
  
    constructor(
      systemInstruction: string, 
      voiceName: string,
      onStatusChange: (status: 'connected' | 'disconnected' | 'error' | 'speaking') => void
    ) {
      this.client = new GoogleGenAI({ apiKey });
      this.systemInstruction = systemInstruction;
      this.voiceName = voiceName;
      this.onStatusChange = onStatusChange;
    }
  
    async connect() {
      if (!apiKey) {
          this.onStatusChange('error');
          console.error("No API Key");
          return;
      }

      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);
  
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.sessionPromise = this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            this.onStatusChange('connected');
            
            // Setup Input Streaming
            if (!this.inputAudioContext) return;
            this.inputNode = this.inputAudioContext.createMediaStreamSource(stream);
            this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = this.createBlob(inputData);
              
              if (this.sessionPromise) {
                  this.sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                  });
              }
            };
            
            this.inputNode.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && this.outputAudioContext && this.outputNode) {
              this.onStatusChange('speaking');
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              
              const audioBuffer = await this.decodeAudioData(
                this.decode(base64Audio),
                this.outputAudioContext,
                24000,
                1
              );
              
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () => {
                this.sources.delete(source);
                if (this.sources.size === 0) {
                    this.onStatusChange('connected'); // Back to idle/listening
                }
              });
              
              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
                console.log("Model interrupted");
                this.stopAudioPlayback();
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            this.onStatusChange('error');
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            this.onStatusChange('disconnected');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: this.voiceName || 'Kore' } },
          },
          systemInstruction: this.systemInstruction,
        },
      });
    }

    private stopAudioPlayback() {
        for (const source of this.sources.values()) {
            source.stop();
            this.sources.delete(source);
        }
        this.nextStartTime = 0;
    }
  
    async disconnect() {
        if (this.sessionPromise) {
            const session = await this.sessionPromise;
            // session.close() might not exist on the type yet depending on version, 
            // but we can cleanup locally. The SDK usually handles close on object disposal or we just cut the stream.
            // There isn't an explicit close method documented in the simplified context, assuming implicit close or we just stop handling.
            // But we must stop AudioContexts.
            if ((session as any).close) (session as any).close(); 
        }

        this.stopAudioPlayback();

        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
            this.scriptProcessor = null;
        }
        if (this.inputNode) {
            this.inputNode.disconnect();
            this.inputNode = null;
        }
        if (this.inputAudioContext) {
            this.inputAudioContext.close();
            this.inputAudioContext = null;
        }
        if (this.outputAudioContext) {
            this.outputAudioContext.close();
            this.outputAudioContext = null;
        }
        this.sessionPromise = null;
        this.onStatusChange('disconnected');
    }
  
    private createBlob(data: Float32Array): Blob {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      return {
        data: this.encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      };
    }
  
    private encode(bytes: Uint8Array) {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
  
    private decode(base64: string) {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
  
    private async decodeAudioData(
      data: Uint8Array,
      ctx: AudioContext,
      sampleRate: number,
      numChannels: number,
    ): Promise<AudioBuffer> {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
      return buffer;
    }
  }