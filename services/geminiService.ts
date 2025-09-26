import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Book, GeminiBookResponse } from "../types";

const bookSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    author: { type: SchemaType.STRING },
    publicationYear: { type: SchemaType.STRING },
    genre: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING }
  },
  required: ["title", "author", "publicationYear", "genre", "description"]
};

export const identifyBooksFromImage = async (
  apiKey: string,
  base64Image: string,
  mimeType: string
): Promise<Book[]> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in the settings.");
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const textPart = {
    text: `
      Analyze the provided image containing books. Identify each distinct book visible. For each book, extract:
      1. Full title
      2. Author
      3. First publication year
      4. Primary genre
      5. One-sentence description

      Use "Unknown" if information is missing. Return JSON only.
    `
  };

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType
    }
  };

  try {
    const response = await model.generateContent({
      contents: [
        {
          parts: [imagePart, textPart]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: bookSchema
        }
      }
    });

    const text = response.response.candidates[0].content.parts[0].text;
    const parsedResponse = JSON.parse(text) as GeminiBookResponse[];

    return parsedResponse.map((book) => ({
      title: book.title,
      author: book.author,
      publicationYear: book.publicationYear,
      genre: book.genre,
      description: book.description
    }));
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid response from Gemini. Check your API key and try again.");
  }
};
