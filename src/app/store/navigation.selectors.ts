import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavigationState } from './navigation.reducer';

export const selectNavigationState =
  createFeatureSelector<NavigationState>('navigation');

export const selectItems = createSelector(
  selectNavigationState,
  (state) => state.items
);

export const selectFilteredItems = createSelector(
  selectNavigationState,
  (state) => state.filteredItems
);

export const selectSearchTerm = createSelector(
  selectNavigationState,
  (state) => state.searchTerm
);

export const selectRecentItems = createSelector(
  selectNavigationState,
  (state) => state.recentItems
);

export const selectLoading = createSelector(
  selectNavigationState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectNavigationState,
  (state) => state.error
);
