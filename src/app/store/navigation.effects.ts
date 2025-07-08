import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import * as NavigationActions from './navigation.actions';
import data from '../smart-navigation/smart_library_mock_data.json';

@Injectable()
export class NavigationEffects {
  private actions$ = inject(Actions);

  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NavigationActions.loadItems),
      delay(500),
      map(() => NavigationActions.loadItemsSuccess({ items: data })),
      catchError((err) =>
        of(NavigationActions.loadItemsFailure({ error: err.message }))
      )
    )
  );
}
