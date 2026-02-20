import { useAppDispatch, useAppSelector } from './redux';
import {
  search,
  loadMore,
  fetchNeighborhoods,
  fetchCategories,
  updateSearchParams,
  clearResults,
} from '../store/slices/searchSlice';
import type { SearchParams } from '../types';

export const useSearch = () => {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search);

  const performSearch = (params: SearchParams) => {
    dispatch(updateSearchParams(params));
    dispatch(search(params));
  };

  const loadMoreResults = () => {
    if (searchState.hasMore && !searchState.isLoading) {
      dispatch(loadMore());
    }
  };

  const loadNeighborhoods = () => {
    if (searchState.neighborhoods.length === 0) {
      dispatch(fetchNeighborhoods());
    }
  };

  const loadCategories = () => {
    if (searchState.categories.length === 0) {
      dispatch(fetchCategories());
    }
  };

  const clear = () => {
    dispatch(clearResults());
  };

  return {
    ...searchState,
    performSearch,
    loadMoreResults,
    loadNeighborhoods,
    loadCategories,
    clear,
  };
};
