import { createAction, props } from '@ngrx/store';
import { NavigationItem } from './../smart-navigation/navigation.types';

export const loadItems = createAction('[Navigation] Load Items');

export const loadItemsSuccess = createAction(
  '[Navigation] Load Items Success',
  props<{ items: NavigationItem[] }>()
);

export const loadItemsFailure = createAction(
  '[Navigation] Load Items Failure',
  props<{ error: string }>()
);

export const filterItems = createAction(
  '[Navigation] Filter Items',
  props<{ searchTerm: string }>()
);

export const selectItem = createAction(
  '[Navigation] Select Item',
  props<{ item: NavigationItem }>()
);
