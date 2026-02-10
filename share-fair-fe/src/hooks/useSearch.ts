import { useAppDispatch, useAppSelector } from './redux';
import { search, loadMore, updateSearchParams, fetchNeighborhoods, fetchCategories } from '../store/slices/searchSlice';
import type { SearchParams } from '../types';
import { useEffect } from 'react';

export const useSearch = () => {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search);

  const performSearch = (params: SearchParams) => {
    dispatch(updateSearchParams(params));
    dispatch(search(params));
  };

  const loadFilters = () => {
    dispatch(fetchNeighborhoods());
    dispatch(fetchCategories());
  };

  const loadNextPage = () => {
    dispatch(loadMore());
  };

  useEffect(() => {
    loadFilters();
    dispatch(search({}));
  }, []);

  return {
    ...searchState,
    performSearch,
    loadFilters,
    loadNextPage,
  };
};
