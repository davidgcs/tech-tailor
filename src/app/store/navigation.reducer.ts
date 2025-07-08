import { createReducer, on } from '@ngrx/store';
import { NavigationItem } from '../smart-navigation/navigation.types';
import * as NavigationActions from './navigation.actions';

export interface NavigationState {
  items: NavigationItem[];
  filteredItems: NavigationItem[];
  searchTerm: string;
  recentItems: NavigationItem[];
  loading: boolean;
  error: string | null;
}

export const initialState: NavigationState = {
  items: [],
  filteredItems: [],
  searchTerm: '',
  recentItems: [],
  loading: false,
  error: null,
};

export const navigationReducer = createReducer(
  initialState,
  on(NavigationActions.loadItems, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(NavigationActions.loadItemsSuccess, (state, { items }) => ({
    ...state,
    items,
    filteredItems: state.searchTerm
      ? items.filter((i) =>
          i.title!.toLowerCase().includes(state.searchTerm.toLowerCase())
        )
      : items,
    loading: false,
  })),
  on(NavigationActions.loadItemsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(NavigationActions.filterItems, (state, { searchTerm }) => {
    // Ignorar si aún no hay items
    if (!state.items.length) {
      return { ...state, searchTerm };
    }
    return {
      ...state,
      searchTerm,
      filteredItems: state.items.filter((item) =>
        item.title!.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };
  }),
  on(NavigationActions.selectItem, (state, { item }) => ({
    ...state,
    recentItems: [
      item,
      ...state.recentItems.filter((r) => r.id !== item.id),
    ].slice(0, 10),
  }))
);
