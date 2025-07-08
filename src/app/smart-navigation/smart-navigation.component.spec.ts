import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SmartNavigationComponent } from './smart-navigation.component';
import { SmartNavigationService } from './smart-navigation.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { WritableSignal } from '@angular/core';
import { NavigationState } from '../store/navigation.reducer';
import * as NavigationActions from '../store/navigation.actions';
import * as NavigationSelectors from '../store/navigation.selectors';

class MockSmartNavigationService {
  saveHistory = jasmine.createSpy('saveHistory');
  loadHistory = jasmine.createSpy('loadHistory').and.returnValue([]);

  debouncedSignal<T>(source: WritableSignal<T>, _ms: number) {
    return source;
  }
}

describe('SmartNavigationComponent', () => {
  let component: SmartNavigationComponent;
  let fixture: ComponentFixture<SmartNavigationComponent>;
  let service: MockSmartNavigationService;
  let store: MockStore;

  const initialState: NavigationState = {
    items: [],
    filteredItems: [],
    searchTerm: '',
    recentItems: [],
    loading: false,
    error: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule, MatAutocompleteModule, SmartNavigationComponent],
      providers: [
        provideMockStore({ initialState: { navigation: initialState } }),
        {
          provide: SmartNavigationService,
          useClass: MockSmartNavigationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SmartNavigationComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(
      SmartNavigationService
    ) as unknown as MockSmartNavigationService;
    store = TestBed.inject(MockStore);

    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadItems action on init', () => {
    component.ngOnInit();

    expect(store.dispatch).toHaveBeenCalledWith(NavigationActions.loadItems());
  });

  it('should open search with Ctrl+K', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });

    component.handleShortcut(event);
    expect(component.searchOpened()).toBeTrue();
  });

  it('should dispatch filterItems action when query changes', fakeAsync(() => {
    (store.dispatch as jasmine.Spy).calls.reset();
    fixture.detectChanges();

    component.query.set('angular');

    tick(300);
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(
      NavigationActions.filterItems({ searchTerm: 'angular' })
    );
  }));

  it('should save search history when query changes', fakeAsync(() => {
    fixture.detectChanges();

    component.query.set('angular');

    tick(300);
    fixture.detectChanges();

    expect(service.saveHistory).toHaveBeenCalled();
  }));


  it('should dispatch selectItem action when item is selected', () => {
    const mockItem = { id: '1', title: 'Test Item' };

    component.onSelectItem(mockItem);

    expect(store.dispatch).toHaveBeenCalledWith(
      NavigationActions.selectItem({ item: mockItem })
    );
  });

  it('should activate search when debounced query is not empty', fakeAsync(() => {
    fixture.detectChanges();

    component.query.set('test');

    tick(300);
    fixture.detectChanges();

    expect(component.searchActive()).toBeTrue();
  }));

  it('should deactivate search when debounced query is empty', fakeAsync(() => {
    fixture.detectChanges();

    component.query.set('test');
    tick(300);
    fixture.detectChanges();
    expect(component.searchActive()).toBeTrue();

    component.query.set('');
    tick(300);
    fixture.detectChanges();
    expect(component.searchActive()).toBeFalse();
  }));

  it('should show filtered items from store', (done) => {
    const mockItems = [
      { id: '1', title: 'Test Item 1' },
      { id: '2', title: 'Test Item 2' },
    ];

    store.overrideSelector(NavigationSelectors.selectFilteredItems, mockItems);
    store.refreshState();
    fixture.detectChanges();

    component.filteredItems$.subscribe((items) => {
      expect(items).toEqual(mockItems);
      done();
    });
  });

  it('should show loading state', (done) => {
    store.overrideSelector(NavigationSelectors.selectLoading, true);
    store.refreshState();
    fixture.detectChanges();

    component.loading$.subscribe((loading) => {
      expect(loading).toBeTrue();
      done();
    });
  });

  it('should show error state', (done) => {
    const errorMessage = 'Test error';
    store.overrideSelector(NavigationSelectors.selectError, errorMessage);
    store.refreshState();
    fixture.detectChanges();

    component.error$.subscribe((error) => {
      expect(error).toBe(errorMessage);
      done();
    });
  });

  it('should prevent default on Ctrl+K shortcut', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });

    spyOn(event, 'preventDefault');

    component.handleShortcut(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });
});
