import { Injectable, Signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SmartNavigationService {
  debouncedSignal<T>(
    sourceSignal: WritableSignal<T>,
    debounceTimeInMs = 0
  ): Signal<T> {
    const source$ = toObservable(sourceSignal);
    const debounced$ = source$.pipe(debounceTime(debounceTimeInMs));
    return toSignal(debounced$, {
      initialValue: sourceSignal(),
    });
  }

  saveHistory(history: string[]): void {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem('searchHistory', JSON.stringify(history));
  }

  loadHistory(): string[] {
    if (typeof localStorage !== 'undefined')
      return JSON.parse(localStorage.getItem('searchHistory') ?? '[]');
    return [];
  }
}
