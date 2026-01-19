
import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Implement manual base64 decode as recommended in the guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Fix: Implement standard audio decoding for raw PCM streams returned by the API
async function decodeAudioData(
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

export const generateVoiceBrand = async (text: string) => {
  // Fix: Directly use process.env.API_KEY in the constructor as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with a sophisticated and welcoming restaurant host voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO], // Only single element AUDIO is supported
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");
    
    return base64Audio;
  } catch (error) {
    console.error("Error generating voice brand:", error);
    return null;
  }
};

export const decodeAudio = async (base64: string, ctx: AudioContext) => {
  // Fix: Utilize robust decoding helper to handle raw PCM bytes
  return await decodeAudioData(decode(base64), ctx, 24000, 1);
};
