import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { PerformanceMetrics } from '../app.component';

export interface ReviewResult {
  performanceMetrics: PerformanceMetrics;
  reviewFeedback: string;
}

export class GeminiAPIError extends Error {
  constructor(
    public type: 'apiKey' | 'network' | 'service' | 'parsing' | 'unknown',
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new GeminiAPIError('apiKey', 'API_KEY environment variable not set.');
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
      - **Security Vulnerabilities**: Potential security risks, including (but not limited to) SQL injection, cross-site scripting (XSS), insecure direct object references (IDOR), authentication bypasses, data exposure, and improper input validation.
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
                propertyOrdering: ["executionTime", "memoryUsage", "complexity"],
              },
              reviewFeedback: { type: Type.STRING },
            },
            propertyOrdering: ["performanceMetrics", "reviewFeedback"],
          },
        },
      });
      
      const jsonString = response.text.trim();
      const result: ReviewResult = JSON.parse(jsonString);
      return result;

    } catch (error: any) {
      console.error('Error calling Gemini API or parsing response:', error);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new GeminiAPIError('network', 'Network error occurred while connecting to Gemini API.', error);
      } else if (error instanceof SyntaxError) {
        throw new GeminiAPIError('parsing', 'Failed to parse Gemini API response as JSON. Model might have returned invalid JSON.', error);
      } else if (error && typeof error === 'object' && error.error) {
        const apiError = error.error; 
        const code = apiError.code;
        const message = apiError.message || 'An API error occurred.';

        if (code === 401 || code === 403) {
          throw new GeminiAPIError('apiKey', `Authentication error: ${message}`, error);
        } else if (code >= 500 && code < 600) {
          throw new GeminiAPIError('service', `Gemini API service error: ${message}`, error);
        } else {
          throw new GeminiAPIError('unknown', `Gemini API responded with an unexpected error: ${message}`, error);
        }
      }
      throw new GeminiAPIError('unknown', `An unknown error occurred: ${error?.message || 'No message provided.'}`, error);
    }
  }
}