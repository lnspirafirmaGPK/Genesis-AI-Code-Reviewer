import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { PerformanceMetrics } from '../app.component';

export interface ReviewResult {
  performanceMetrics: PerformanceMetrics;
  reviewFeedback: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error('API_KEY environment variable not set');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async reviewCode(code: string, language: string): Promise<ReviewResult> {
    const prompt = `
      You are an expert senior software engineer performing a meticulous code review.
      The provided code snippet is written in ${language}. Please tailor your review and analysis to the specific conventions, best practices, and common pitfalls of this language.

      Analyze the following code snippet and provide two things in your response:
      1. A performance analysis with estimated metrics.
      2. A detailed, constructive code review.

      Your response MUST be a valid JSON object with the following structure:
      {
        "performanceMetrics": {
          "executionTime": "<qualitative estimation, e.g., 'Very Fast (<10ms)'>",
          "memoryUsage": "<qualitative estimation, e.g., 'Low'>",
          "complexity": "<Big O notation, e.g., 'O(n)'>"
        },
        "reviewFeedback": "<Your detailed code review formatted in markdown>"
      }

      The code review portion should cover:
      - **Potential Bugs & Errors**: Logical errors, edge cases, potential runtime exceptions.
      - **Performance Optimizations**: Suggestions for efficiency, memory, and speed.
      - **Best Practices & Readability**: Adherence to standards, naming conventions, and clarity.
      - **Security Vulnerabilities**: Potential security risks.
      - **Refactoring Suggestions**: Alternative implementations or design patterns.

      Be professional and encouraging in your tone.

      --- CODE TO REVIEW ---
      \`\`\`${language.toLowerCase() === 'unknown' ? '' : language.toLowerCase()}
      ${code}
      \`\`\`
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              performanceMetrics: {
                type: Type.OBJECT,
                properties: {
                  executionTime: { type: Type.STRING },
                  memoryUsage: { type: Type.STRING },
                  complexity: { type: Type.STRING },
                },
              },
              reviewFeedback: { type: Type.STRING },
            },
          },
        },
      });
      
      const jsonString = response.text.trim();
      const result: ReviewResult = JSON.parse(jsonString);
      return result;

    } catch (error) {
      console.error('Error calling Gemini API or parsing response:', error);
      // Re-throw the original error to allow for more specific handling upstream.
      throw error;
    }
  }
}