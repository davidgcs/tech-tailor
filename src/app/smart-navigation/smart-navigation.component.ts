import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { SmartNavigationService } from './smart-navigation.service';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import data from './smart_library_mock_data.json';
import { NavigationItem } from './navigation.types';

@Component({
  selector: 'app-smart-navigation',
  templateUrl: './smart-navigation.component.html',
  styleUrls: ['./smart-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatAutocompleteModule],
})
export class SmartNavigationComponent {
  private readonly navService = inject(SmartNavigationService);

  query = signal('');
  debouncedQuery: Signal<string> = this.navService.debouncedSignal(
    this.query,
    300
  );
  history: WritableSignal<string[]> = signal([]);
  searchActive = signal(false);
  searchOpened = signal(false);
  options: WritableSignal<NavigationItem[]> = signal([]);

  constructor() {
    effect(() => {
      if (this.debouncedQuery() !== '') {
        this.searchActive.set(true);
        this.history.update((newValue) => [...newValue, this.debouncedQuery()]);
      } else {
        this.searchActive.set(false);
      }
    });
    this.options.set(data);

    effect(() => {
      if (this.history().length > 10) {
        this.history.set(this.history().slice(-10));
      }
      this.navService.saveHistory(this.history());
    });
  }

  ngOnInit() {
    this.history.set(this.navService.loadHistory());
  }

  @HostListener('window:keydown', ['$event'])
  handleShortcut(ev: KeyboardEvent) {
    if (ev.ctrlKey && ev.key.toLowerCase() === 'k') {
      ev.preventDefault();
      this.searchOpened.update((i) => !i);
    }
  }
}
