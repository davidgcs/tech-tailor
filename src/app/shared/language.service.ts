import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLang$$ = signal<'en' | 'es'>('en');
  private translations: Record<string, any> = {};

  constructor(private http: HttpClient) {
    this.loadTranslations('en');
  }

  get currentLang(): 'en' | 'es' {
    return this.currentLang$$();
  }
  get langSignal(): WritableSignal<'en' | 'es'> {
    return this.currentLang$$;
  }

  changeLang(lang: 'en' | 'es') {
    if (lang === this.currentLang) return;
    this.currentLang$$.set(lang);
    this.loadTranslations(lang);
  }

  private loadTranslations(lang: 'en' | 'es') {
    this.http
      .get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      .subscribe((t) => (this.translations = t));
  }

  translate(path: string, params?: Record<string, string>): string {
    const keys = path.split('.');
    let result: any = this.translations;
    for (const k of keys) {
      result = result?.[k];
      if (result == null) return path;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{{${k}}}`, v);
      });
    }
    return result;
  }
}
