import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { ReviewResult, GeminiAPIError } from './gemini.service'; // Reuse types

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  private configService = inject(ConfigService);

  async reviewCode(code: string, language: string): Promise<ReviewResult> {
    const apiKey = this.configService.openaiKey();
    if (!apiKey) {
      throw new GeminiAPIError('apiKey', 'API Key is missing. Please configure it in settings.');
    }

    const modelId = this.configService.activeOpenAIModel();

    const systemPrompt = `
      You are an expert senior software engineer performing a meticulous code review.
      The provided code snippet is written in ${language}. Please tailor your review and analysis to the specific conventions, best practices, and common pitfalls of this language.

      Your output must be strictly valid JSON. Do not wrap the JSON in markdown code blocks.
    `;

    const userPrompt = `
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || response.statusText;
        if (response.status === 401 || response.status === 403) {
          throw new GeminiAPIError('apiKey', `OpenAI Auth Error: ${message}`);
        } else if (response.status >= 500) {
          throw new GeminiAPIError('service', `OpenAI Service Error: ${message}`);
        } else {
          throw new GeminiAPIError('unknown', `OpenAI API Error (${response.status}): ${message}`);
        }
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new GeminiAPIError('parsing', 'OpenAI returned empty response.');
      }

      return JSON.parse(content);

    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      if (error instanceof GeminiAPIError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
         throw new GeminiAPIError('network', 'Network error occurred while connecting to OpenAI API.', error);
      }
      throw new GeminiAPIError('unknown', `An unknown error occurred: ${error?.message}`, error);
    }
  }
}
