import { Pipe, PipeTransform } from '@angular/core';
import { computed } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({ name: 'translate', pure: true })
export class TranslatePipe implements PipeTransform {
  constructor(private lang: LanguageService) {}

  transform(key: string, params?: Record<string, string>) {
    return computed(() => {
      this.lang.langSignal();
      return this.lang.translate(key, params);
    })();
  }
}
