import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SmartNavigationComponent } from './smart-navigation.component';
import { SmartNavigationService } from './smart-navigation.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { signal, WritableSignal } from '@angular/core';

class MockSmartNavigationService {
  saveHistory = jasmine.createSpy('saveHistory');
  loadHistory = jasmine.createSpy('loadHistory').and.returnValue([]);

  debouncedSignal<T>(source: WritableSignal<T>, _ms: number) {
    return signal(source());
  }
}

describe('SmartNavigationComponent', () => {
  let component: SmartNavigationComponent;
  let fixture: ComponentFixture<SmartNavigationComponent>;
  let service: MockSmartNavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule, MatAutocompleteModule, SmartNavigationComponent],
      providers: [
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open search with Ctrl+K', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(component.searchOpened()).toBeTrue();
  });

  it('should limit history to 10 items', fakeAsync(() => {
    for (let i = 0; i < 12; i++) {
      component.query.set('item' + i);
      tick(300);
    }
    expect(component.history().length).toBeLessThanOrEqual(10);
  }));

  it('should load history on init', () => {
    expect(service.loadHistory).toHaveBeenCalled();
  });

  it('should save history after query changes', fakeAsync(() => {
    component.query.set('angular');
    tick(300);
    expect(service.saveHistory).toHaveBeenCalled();
  }));
});
