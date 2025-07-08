import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { SmartNavigationService } from './smart-navigation.service';
import { NavigationItem } from './navigation.types';
import { IntersectionObserverService } from '../shared/intersection-observer.service';
import { smartNavigationAnimations } from '../animations/smart-navigation.animations';
import * as NavigationActions from '../store/navigation.actions';
import * as NavigationSelectors from '../store/navigation.selectors';
import { gsap } from 'gsap';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../shared/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-smart-navigation',
  templateUrl: './smart-navigation.component.html',
  styleUrls: ['./smart-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatAutocompleteModule,
    AsyncPipe,
    ScrollingModule,
    CommonModule,
    TranslatePipe,
    TranslateModule,
  ],
  animations: smartNavigationAnimations,
  providers: [LanguageService],
})
export class SmartNavigationComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private readonly store = inject(Store);
  private readonly navService = inject(SmartNavigationService);
  private readonly intersectionService = inject(IntersectionObserverService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly lang = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('searchContainer', { read: ElementRef })
  searchContainer!: ElementRef;
  @ViewChild('virtualScroll')
  virtualScroll!: CdkVirtualScrollViewport;
  @ViewChild('searchInput', { read: ElementRef, static: true })
  searchInput!: ElementRef<HTMLInputElement>;

  query = signal('');
  debouncedQuery = this.navService.debouncedSignal(this.query, 300);
  searchActive = signal(false);
  searchOpened = signal(false);
  isVisible = signal(true);
  animationsEnabled = signal(true);

  filteredItems$ = this.store.select(NavigationSelectors.selectFilteredItems);
  loading$ = this.store.select(NavigationSelectors.selectLoading);
  error$ = this.store.select(NavigationSelectors.selectError);

  private searchTimeline: gsap.core.Timeline | null = null;

  constructor() {
    effect(() => {
      const query = this.debouncedQuery();
      if (query !== '') {
        this.searchActive.set(true);
        this.store.dispatch(
          NavigationActions.filterItems({ searchTerm: query })
        );
        this.cdr.markForCheck();

        const currentHistory = this.navService.loadHistory();
        const newHistory = [
          query,
          ...currentHistory.filter((h) => h !== query),
        ].slice(0, 10);
        this.navService.saveHistory(newHistory);
      } else {
        this.searchActive.set(false);
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(NavigationActions.loadItems());
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.initializeGSAPAnimations();
  }

  trackByItemId = (index: number, item: NavigationItem): string => item.id;

  private setupIntersectionObserver() {
    if (this.searchContainer && this.intersectionService.isSupported()) {
      this.intersectionService
        .createObserver(this.searchContainer?.nativeElement)
        .pipe(takeUntil(this.destroy$))
        .subscribe((isVisible) => {
          this.isVisible.set(isVisible);
          this.animationsEnabled.set(isVisible);

          if (!isVisible && this.searchTimeline) {
            this.searchTimeline.pause();
          } else if (isVisible && this.searchTimeline) {
            this.searchTimeline.resume();
          }
        });
    }
  }

  private initializeGSAPAnimations() {
    this.searchTimeline = gsap.timeline({ paused: true });
  }

  private cleanupAnimations() {
    if (this.searchTimeline) {
      this.searchTimeline.kill();
      this.searchTimeline = null;
    }
  }

  private toggleSearch() {
    const wasOpened = this.searchOpened();
    this.searchOpened.update((i) => !i);
    this.cdr.detectChanges();

    if (this.animationsEnabled()) {
      setTimeout(() => {
        if (!wasOpened) {
          this.animateSearchOpen();
        } else {
          this.animateSearchClose();
        }
      }, 0);
    }
  }

  private animateSearchOpen() {
    const container = document.querySelector('.modal-backdrop');
    const searchEl = container?.querySelector('#search');

    if (!searchEl) return;

    gsap.fromTo(
      searchEl,
      {
        opacity: 0,
        scale: 0.8,
        y: -20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.7)',
        onStart: () => {
          setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
        },
      }
    );
  }

  private animateSearchClose() {
    if (!this.searchContainer) return;

    gsap.to(this.searchContainer.nativeElement.querySelector('#search'), {
      opacity: 0,
      scale: 0.8,
      y: -20,
      duration: 0.25,
      ease: 'power2.in',
    });
  }

  onSelectItem(item: NavigationItem) {
    this.store.dispatch(NavigationActions.selectItem({ item }));

    if (this.animationsEnabled()) {
      this.animateItemSelection(item);
    }
  }

  private animateItemSelection(item: NavigationItem) {
    const itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
    if (itemElement) {
      gsap.to(itemElement, {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  }

  getHistory(): string[] {
    return this.navService.loadHistory();
  }

  shouldUseVirtualScroll(items: NavigationItem[] | null): boolean {
    return (items?.length || 0) > 100;
  }

  public changeLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupAnimations();
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcut(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      this.toggleSearch();
    }
  }
}
