import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { GeminiAPIError, ReviewResult } from './services/gemini.service';
import { CodeReviewService } from './services/code-review.service';
import { ConfigService, AVAILABLE_MODELS, AIProvider, AIModel } from './services/config.service';
import { detectLanguage } from './utils/language-detection';
import { translations, Translation } from './utils/translations';

declare var prettier: any;
declare var prettierPlugins: any;

interface AppError {
  type: 'apiKey' | 'network' | 'service' | 'parsing' | 'unknown';
  causes: (keyof Translation['errors']['causes'])[];
  actions: (keyof Translation['errors']['actions'])[];
}

export interface PerformanceMetrics {
  executionTime: string;
  memoryUsage: string;
  complexity: string;
}

export interface HistoryEntry {
  timestamp: string; // ISO string
  code: string;
  language: string;
  performanceMetrics: PerformanceMetrics | null;
  reviewFeedback: string | null;
  provider: string;
  model: string;
}

const LOCAL_STORAGE_CODE_KEY = 'ai_code_reviewer_code';
const LOCAL_STORAGE_LANG_KEY = 'ai_code_reviewer_code_language';
const LOCAL_STORAGE_APP_LANG_KEY = 'ai_code_reviewer_app_language';
const LOCAL_STORAGE_HISTORY_KEY = 'ai_code_reviewer_history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly codeReviewService = inject(CodeReviewService);
  readonly configService = inject(ConfigService);

  code = signal<string>('');
  performanceMetrics = signal<PerformanceMetrics | null>(null);
  reviewFeedback = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<AppError | null>(null);
  copied = signal<boolean>(false);
  detectedLanguage = signal<string>('Plain Text');
  
  currentLanguage = signal<'en' | 'th'>('en');
  t = computed(() => translations[this.currentLanguage()]);

  reviewHistory = signal<HistoryEntry[]>([]);
  activeOutputTab = signal<'feedback' | 'history'>('feedback');

  showSettings = signal<boolean>(false);

  availableModels = computed(() => AVAILABLE_MODELS[this.configService.activeProvider()]);

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

    const savedAppLanguage = localStorage.getItem(LOCAL_STORAGE_APP_LANG_KEY);
    if (savedAppLanguage === 'en' || savedAppLanguage === 'th') {
      this.currentLanguage.set(savedAppLanguage);
    }

    const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (savedHistory) {
      this.reviewHistory.set(JSON.parse(savedHistory));
    }

    effect(() => {
      localStorage.setItem(LOCAL_STORAGE_CODE_KEY, this.code());
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, this.detectedLanguage());
      localStorage.setItem(LOCAL_STORAGE_APP_LANG_KEY, this.currentLanguage());
    });

    effect(() => {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(this.reviewHistory()));
    });
  }

  setLanguage(lang: 'en' | 'th'): void {
    this.currentLanguage.set(lang);
  }

  toggleSettings(): void {
    this.showSettings.update(v => !v);
  }

  onProviderChange(event: Event): void {
    const provider = (event.target as HTMLSelectElement).value as AIProvider;
    this.configService.activeProvider.set(provider);
  }

  onModelChange(event: Event): void {
    const model = (event.target as HTMLSelectElement).value;
    if (this.configService.activeProvider() === 'gemini') {
      this.configService.activeGeminiModel.set(model);
    } else {
      this.configService.activeOpenAIModel.set(model);
    }
  }

  onKeyChange(event: Event): void {
     const key = (event.target as HTMLInputElement).value;
     if (this.configService.activeProvider() === 'gemini') {
      this.configService.geminiKey.set(key);
    } else {
      this.configService.openaiKey.set(key);
    }
  }

  getActiveModelDescription(): string {
    const models = this.availableModels();
    const activeId = this.configService.getActiveModelId();
    return models.find(m => m.id === activeId)?.description || '';
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

    // Check for API Key before starting
    if (!this.configService.getActiveKey()) {
        this.error.set({
            type: 'apiKey',
            causes: ['apiKey'],
            actions: ['verifyKey']
        });
        this.showSettings.set(true); // Auto open settings
        return;
    }

    this.isLoading.set(true);
    this.reviewFeedback.set(null);
    this.performanceMetrics.set(null);
    this.error.set(null);
    this.activeOutputTab.set('feedback'); // Switch to feedback tab on new review

    try {
      const result: ReviewResult = await this.codeReviewService.reviewCode(this.code(), this.detectedLanguage());
      this.performanceMetrics.set(result.performanceMetrics);
      this.reviewFeedback.set(result.reviewFeedback);
      this.addToHistory(this.code(), this.detectedLanguage(), result.performanceMetrics, result.reviewFeedback);
    } catch (e) {
      console.error(e);
      let errorType: AppError['type'] = 'unknown';
      let causes: (keyof Translation['errors']['causes'])[] = ['unknown'];
      let actions: (keyof Translation['errors']['actions'])[] = ['reportBug'];

      if (e instanceof GeminiAPIError) {
        errorType = e.type;
        switch (e.type) {
          case 'apiKey':
            causes = ['apiKey'];
            actions = ['verifyKey'];
            this.showSettings.set(true);
            break;
          case 'network':
            causes = ['network'];
            actions = ['checkNetwork', 'tryAgain'];
            break;
          case 'service':
            causes = ['service'];
            actions = ['tryAgain'];
            break;
          case 'parsing':
            causes = ['parsing'];
            actions = ['reportBug', 'tryAgain'];
            break;
          default: // 'unknown'
            causes = ['unknown'];
            actions = ['reportBug', 'tryAgain'];
            break;
        }
      }

      this.error.set({
        type: errorType,
        causes: causes,
        actions: actions,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private addToHistory(code: string, language: string, performanceMetrics: PerformanceMetrics | null, reviewFeedback: string | null): void {
    const newEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      code: code,
      language: language,
      performanceMetrics: performanceMetrics,
      reviewFeedback: reviewFeedback,
      provider: this.configService.activeProvider(),
      model: this.configService.getActiveModelId()
    };
    this.reviewHistory.update(history => [newEntry, ...history.slice(0, 9)]); // Keep last 10 entries
  }

  loadHistoryEntry(entry: HistoryEntry): void {
    this.code.set(entry.code);
    this.detectedLanguage.set(entry.language);
    this.performanceMetrics.set(entry.performanceMetrics);
    this.reviewFeedback.set(entry.reviewFeedback);
    this.error.set(null); // Clear any existing error
    this.activeOutputTab.set('feedback'); // Switch back to feedback tab
  }

  clearHistory(): void {
    this.reviewHistory.set([]);
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(this.currentLanguage());
  }

  getShortCodeSnippet(code: string): string {
    const lines = code.split('\n');
    if (lines.length <= 3) {
      return code;
    }
    return lines.slice(0, 3).join('\n') + '\n...';
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
    this.reviewHistory.set([]); // Clear history on full app reset
    localStorage.removeItem(LOCAL_STORAGE_CODE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LANG_KEY);
    localStorage.removeItem(LOCAL_STORAGE_APP_LANG_KEY);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  }
}
