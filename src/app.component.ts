import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { GeminiService, ReviewResult } from './services/gemini.service';
import { detectLanguage } from './utils/language-detection';
import { translations, Translation } from './utils/translations';

declare var prettier: any;
declare var prettierPlugins: any;

interface AppError {
  titleKey: keyof Translation['errors'];
  messageKey: keyof Translation['errors'];
  causes: (keyof Translation['errors']['causes'])[];
  actions: (keyof Translation['errors']['actions'])[];
}

export interface PerformanceMetrics {
  executionTime: string;
  memoryUsage: string;
  complexity: string;
}

const LOCAL_STORAGE_CODE_KEY = 'ai_code_reviewer_code';
const LOCAL_STORAGE_LANG_KEY = 'ai_code_reviewer_language';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  code = signal<string>('');
  performanceMetrics = signal<PerformanceMetrics | null>(null);
  reviewFeedback = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<AppError | null>(null);
  copied = signal<boolean>(false);
  detectedLanguage = signal<string>('Plain Text');
  
  currentLanguage = signal<'en' | 'th'>('en');
  t = computed(() => translations[this.currentLanguage()]);

  isFormattingSupported = computed(() => {
    const lang = this.detectedLanguage();
    const supportedLangs = ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Markdown'];
    return supportedLangs.includes(lang);
  });
  
  fullFeedbackText = computed(() => {
    const metrics = this.performanceMetrics();
    const feedback = this.reviewFeedback();
    const t = this.t();

    if (!metrics && !feedback) {
      return '';
    }

    let fullText = '';
    if (metrics) {
      fullText += `${t.performanceReport}\n`;
      fullText += '-------------------------\n';
      fullText += `${t.executionTime}: ${metrics.executionTime}\n`;
      fullText += `${t.memoryUsage}: ${metrics.memoryUsage}\n`;
      fullText += `${t.complexity}: ${metrics.complexity}\n\n`;
    }

    if (feedback) {
      fullText += `${t.feedback}\n`;
      fullText += '-------------------------\n';
      fullText += feedback;
    }

    return fullText.trim();
  });

  constructor() {
    const savedCode = localStorage.getItem(LOCAL_STORAGE_CODE_KEY) ?? '';
    this.code.set(savedCode);

    const savedLanguage = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    if (savedLanguage) {
      this.detectedLanguage.set(savedLanguage);
    } else if (savedCode) {
      this.detectedLanguage.set(detectLanguage(savedCode));
    }

    effect(() => {
      localStorage.setItem(LOCAL_STORAGE_CODE_KEY, this.code());
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, this.detectedLanguage());
    });
  }

  setLanguage(lang: 'en' | 'th'): void {
    this.currentLanguage.set(lang);
  }

  onCodeInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newCode = textarea.value;
    this.code.set(newCode);
    this.detectedLanguage.set(detectLanguage(newCode));
  }

  async formatCode(): Promise<void> {
    if (!this.isFormattingSupported() || !this.code().trim()) {
      return;
    }

    const lang = this.detectedLanguage();
    const parserMap: { [key: string]: string } = {
      TypeScript: 'typescript',
      JavaScript: 'babel',
      HTML: 'html',
      CSS: 'css',
      Markdown: 'markdown',
    };

    const parser = parserMap[lang];
    if (!parser) {
      console.warn(`Formatting not supported for ${lang}`);
      return;
    }

    try {
      const formattedCode = await prettier.format(this.code(), {
        parser: parser,
        plugins: prettierPlugins,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
      });
      this.code.set(formattedCode);
    } catch (error) {
      console.error('Could not format code due to syntax errors:', error);
      // In a real app, we might show a toast notification to the user here.
    }
  }

  async reviewCode(): Promise<void> {
    if (!this.code().trim()) {
      return;
    }

    this.isLoading.set(true);
    this.reviewFeedback.set(null);
    this.performanceMetrics.set(null);
    this.error.set(null);

    try {
      const result: ReviewResult = await this.geminiService.reviewCode(this.code(), this.detectedLanguage());
      this.performanceMetrics.set(result.performanceMetrics);
      this.reviewFeedback.set(result.reviewFeedback);
    } catch (e) {
      console.error(e);
      this.error.set({
        titleKey: 'title',
        messageKey: 'message',
        causes: ['apiKey', 'network', 'service'],
        actions: ['verifyKey', 'checkNetwork', 'tryAgain']
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  copyFeedback(): void {
    const textToCopy = this.fullFeedbackText();
    if (!textToCopy) {
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }).catch(err => {
      console.error('Failed to copy feedback to clipboard:', err);
    });
  }

  resetApp(): void {
    this.code.set('');
    this.performanceMetrics.set(null);
    this.reviewFeedback.set(null);
    this.isLoading.set(false);
    this.error.set(null);
    this.copied.set(false);
    this.detectedLanguage.set('Plain Text');
    localStorage.removeItem(LOCAL_STORAGE_CODE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LANG_KEY);
  }
}