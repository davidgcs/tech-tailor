import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IntersectionObserverService {
  private platformId = inject(PLATFORM_ID);

  createObserver(
    element: HTMLElement,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): Observable<boolean> {
    return new Observable((observer) => {
      if (!isPlatformBrowser(this.platformId)) {
        observer.next(true);
        return;
      }

      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          observer.next(entry.isIntersecting);
        });
      }, options);

      intersectionObserver.observe(element);

      return () => {
        intersectionObserver.disconnect();
      };
    });
  }

  isSupported(): boolean {
    return (
      isPlatformBrowser(this.platformId) && 'IntersectionObserver' in window
    );
  }
}
