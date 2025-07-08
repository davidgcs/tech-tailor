import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SmartNavigationService } from './smart-navigation.service';
import { NavigationItem } from './navigation.types';
import * as NavigationActions from '../store/navigation.actions';
import * as NavigationSelectors from '../store/navigation.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-smart-navigation',
  templateUrl: './smart-navigation.component.html',
  styleUrls: ['./smart-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatAutocompleteModule, AsyncPipe],
})
export class SmartNavigationComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly navService = inject(SmartNavigationService);

  query = signal('');
  debouncedQuery = this.navService.debouncedSignal(this.query, 300);
  searchActive = signal(false);
  searchOpened = signal(false);

  filteredItems$ = this.store.select(NavigationSelectors.selectFilteredItems);
  loading$ = this.store.select(NavigationSelectors.selectLoading);
  error$ = this.store.select(NavigationSelectors.selectError);

  constructor() {
    effect(() => {
      const query = this.debouncedQuery();
      if (query !== '') {
        this.searchActive.set(true);
        this.store.dispatch(
          NavigationActions.filterItems({ searchTerm: query })
        );

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

  @HostListener('window:keydown', ['$event'])
  handleShortcut(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      this.searchOpened.update((i) => !i);
    }
  }

  onSelectItem(item: NavigationItem) {
    this.store.dispatch(NavigationActions.selectItem({ item }));
  }

  getHistory(): string[] {
    return this.navService.loadHistory();
  }
}
