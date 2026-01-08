import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { GeminiService, ReviewResult } from './gemini.service';
import { OpenAIService } from './openai.service';

@Injectable({ providedIn: 'root' })
export class CodeReviewService {
  private configService = inject(ConfigService);
  private geminiService = inject(GeminiService);
  private openAIService = inject(OpenAIService);

  async reviewCode(code: string, language: string): Promise<ReviewResult> {
    const provider = this.configService.activeProvider();

    if (provider === 'gemini') {
      return this.geminiService.reviewCode(code, language);
    } else {
      return this.openAIService.reviewCode(code, language);
    }
  }
}
