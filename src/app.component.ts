import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GeminiService } from './services/gemini.service';
import { detectLanguage } from './utils/language-detection';
import { translations, Translation } from './utils/translations';

interface AppError {
  titleKey: keyof Translation['errors'];
  messageKey: keyof Translation['errors'];
  causes: (keyof Translation['errors']['causes'])[];
  actions: (keyof Translation['errors']['actions'])[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  code = signal<string>('');
  reviewFeedback = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<AppError | null>(null);
  copied = signal<boolean>(false);
  detectedLanguage = signal<string>('Plain Text');
  
  currentLanguage = signal<'en' | 'th'>('en');
  t = computed(() => translations[this.currentLanguage()]);

  setLanguage(lang: 'en' | 'th'): void {
    this.currentLanguage.set(lang);
  }

  onCodeInputChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newCode = textarea.value;
    this.code.set(newCode);
    this.detectedLanguage.set(detectLanguage(newCode));
  }

  async reviewCode(): Promise<void> {
    if (!this.code().trim()) {
      return;
    }

    this.isLoading.set(true);
    this.reviewFeedback.set(null);
    this.error.set(null);

    try {
      const feedback = await this.geminiService.reviewCode(this.code(), this.detectedLanguage());
      this.reviewFeedback.set(feedback);
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
    const feedback = this.reviewFeedback();
    if (!feedback) {
      return;
    }

    navigator.clipboard.writeText(feedback).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }).catch(err => {
      console.error('Failed to copy feedback to clipboard:', err);
    });
  }
}
