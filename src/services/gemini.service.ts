import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error('API_KEY environment variable not set');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async reviewCode(code: string, language: string): Promise<string> {
    const prompt = `
      You are an expert senior software engineer performing a meticulous code review.
      The provided code snippet is written in ${language}. Please tailor your review to the specific conventions, best practices, and common pitfalls of this language.

      Analyze the following code snippet and provide detailed, constructive feedback.

      Your review should cover the following aspects:
      1.  **Potential Bugs & Errors**: Identify any logical errors, edge cases not handled, or potential runtime exceptions.
      2.  **Performance Optimizations**: Suggest improvements for efficiency, memory usage, and speed.
      3.  **Best Practices & Readability**: Comment on adherence to ${language}-specific coding standards, naming conventions, and overall code clarity. Suggest ways to make the code more maintainable.
      4.  **Security Vulnerabilities**: Point out any potential security risks like injection flaws, data exposure, etc.
      5.  **Refactoring Suggestions**: Provide alternative implementations or design patterns that could improve the code structure.

      Format your feedback clearly using markdown. Use headings for each section (e.g., "### Potential Bugs").
      Provide specific code examples for your suggestions where applicable. Be professional and encouraging in your tone.

      --- CODE TO REVIEW ---
      \`\`\`${language.toLowerCase() === 'unknown' ? '' : language.toLowerCase()}
      ${code}
      \`\`\`
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Re-throw the original error to allow for more specific handling upstream.
      throw error;
    }
  }
}
