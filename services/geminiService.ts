import { GoogleGenerativeAI } from "@google/generative-ai";
import { Book, GeminiBookResponse } from '../types';

export const identifyBooksFromImage = async (apiKey: string, base64Image: string, mimeType: string): Promise<Book[]> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in the settings.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Analyze the provided image containing books. Identify each distinct book visible. For each book, extract the following details with high accuracy:
    1. The full title of the book.
    2. The full name of the author.
    3. The year the book was FIRST published.
    4. The primary literary genre of the book (e.g., Fiction, Sci-Fi, History).
    5. A concise, one-sentence description of the book's content or plot.
    
    If any piece of information cannot be determined, use the string "Unknown". 
    Return the data for all identified books as a JSON array with this exact structure:
    [{"title": "Book Title", "author": "Author Name", "publicationYear": "YYYY", "genre": "Genre", "description": "Description"}]
    
    Return ONLY the JSON array, no other text.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.replace(/^data:image\/[a-z]+;base64,/, ''),
      mimeType: mimeType,
    },
  };
  
  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text
    const jsonText = text.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^[\{]*/, '')
      .replace(/[^}\]]*$/, '');
    
    console.log('Raw API response:', text);
    console.log('Cleaned JSON:', jsonText);
    
    const parsedResponse = JSON.parse(jsonText) as GeminiBookResponse[];
    
    const books: Book[] = parsedResponse.map(book => ({
      title: book.title || "Unknown",
      author: book.author || "Unknown",
      publicationYear: book.publicationYear || "Unknown",
      genre: book.genre || "Unknown",
      description: book.description || "Unknown"
    }));
    
    return books;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error("Invalid API key. Please check your Gemini API key in settings.");
      }
      if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error("API quota exceeded. Please check your Gemini API usage limits.");
      }
    }
    throw new Error("Failed to get a valid response from the AI model. Please try again or check your API key.");
  }
};
