import { GoogleGenAI, Type } from "@google/genai";

interface AnalyzeInput {
  text?: string;
  fileData?: string; // Base64 string
  mimeType?: string;
}

// We extract specific entities from clinical trial abstracts or full papers
export const analyzeDocument = async (input: AnalyzeInput): Promise<{
  hasTRN: boolean;
  trn: string | null;
  enrollmentMentioned: boolean;
  registrationMentioned: boolean;
  extractedDates: string[];
  analysis: string;
}> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Using Flash model for efficiency with long contexts (PDFs)
    const modelId = "gemini-3-flash-preview"; 

    const parts: any[] = [];

    parts.push({
      text: `
        Analyze the provided clinical trial document (abstract or full PDF paper). 
        Your goal is to extract the Trial Registration Number (TRN) if present, and any dates related to 'enrollment start' or 'trial registration'.
        
        If this is a full paper, look specifically in the Methods, Design, or footnote sections for registration details.
        
        Return the response in JSON format.
      `
    });

    if (input.fileData && input.mimeType) {
      parts.push({
        inlineData: {
          data: input.fileData,
          mimeType: input.mimeType
        }
      });
    } else if (input.text) {
      parts.push({ text: `Text Content:\n"${input.text}"` });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasTRN: { type: Type.BOOLEAN },
            trn: { type: Type.STRING, description: "The alphanumeric trial registration number (e.g., NCT01234567, ISRCTN12345678). Null if not found." },
            enrollmentMentioned: { type: Type.BOOLEAN, description: "Does the text mention when participant enrollment started?" },
            registrationMentioned: { type: Type.BOOLEAN, description: "Does the text mention when the trial was registered?" },
            extractedDates: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of any specific dates (YYYY-MM-DD or Month Year) found related to study timeline."
            },
            analysis: { type: Type.STRING, description: "A brief 1-sentence summary of the registration status found." }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      hasTRN: false,
      trn: null,
      enrollmentMentioned: false,
      registrationMentioned: false,
      extractedDates: [],
      analysis: "Failed to analyze document due to an error."
    };
  }
};
