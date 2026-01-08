import { Injectable, signal, effect } from '@angular/core';

export type AIProvider = 'gemini' | 'openai';

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  isReasoning?: boolean;
}

export const AVAILABLE_MODELS: Record<AIProvider, AIModel[]> = {
  gemini: [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Exp)', description: 'Fast and efficient', isReasoning: false },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Best for complex reasoning', isReasoning: true },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Balance of speed and cost', isReasoning: false },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Fast and intelligent', isReasoning: true },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability', isReasoning: true },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', isReasoning: false },
  ]
};

const LS_PROVIDER_KEY = 'ai_code_reviewer_provider';
const LS_GEMINI_KEY = 'ai_code_reviewer_key_gemini';
const LS_OPENAI_KEY = 'ai_code_reviewer_key_openai';
const LS_MODEL_GEMINI_KEY = 'ai_code_reviewer_model_gemini';
const LS_MODEL_OPENAI_KEY = 'ai_code_reviewer_model_openai';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  activeProvider = signal<AIProvider>('gemini');
  geminiKey = signal<string>('');
  openaiKey = signal<string>('');

  activeGeminiModel = signal<string>(AVAILABLE_MODELS.gemini[0].id);
  activeOpenAIModel = signal<string>(AVAILABLE_MODELS.openai[0].id);

  constructor() {
    this.loadSettings();

    // Persist settings whenever they change
    effect(() => localStorage.setItem(LS_PROVIDER_KEY, this.activeProvider()));
    effect(() => localStorage.setItem(LS_GEMINI_KEY, this.geminiKey()));
    effect(() => localStorage.setItem(LS_OPENAI_KEY, this.openaiKey()));
    effect(() => localStorage.setItem(LS_MODEL_GEMINI_KEY, this.activeGeminiModel()));
    effect(() => localStorage.setItem(LS_MODEL_OPENAI_KEY, this.activeOpenAIModel()));
  }

  private loadSettings() {
    const savedProvider = localStorage.getItem(LS_PROVIDER_KEY) as AIProvider;
    if (savedProvider && (savedProvider === 'gemini' || savedProvider === 'openai')) {
      this.activeProvider.set(savedProvider);
    }

    const savedGeminiKey = localStorage.getItem(LS_GEMINI_KEY);
    if (savedGeminiKey) this.geminiKey.set(savedGeminiKey);

    const savedOpenAIKey = localStorage.getItem(LS_OPENAI_KEY);
    if (savedOpenAIKey) this.openaiKey.set(savedOpenAIKey);

    const savedGeminiModel = localStorage.getItem(LS_MODEL_GEMINI_KEY);
    if (savedGeminiModel && AVAILABLE_MODELS.gemini.some(m => m.id === savedGeminiModel)) {
      this.activeGeminiModel.set(savedGeminiModel);
    }

    const savedOpenAIModel = localStorage.getItem(LS_MODEL_OPENAI_KEY);
    if (savedOpenAIModel && AVAILABLE_MODELS.openai.some(m => m.id === savedOpenAIModel)) {
      this.activeOpenAIModel.set(savedOpenAIModel);
    }
  }

  getActiveKey(): string {
    return this.activeProvider() === 'gemini' ? this.geminiKey() : this.openaiKey();
  }

  getActiveModelId(): string {
    return this.activeProvider() === 'gemini' ? this.activeGeminiModel() : this.activeOpenAIModel();
  }
}
