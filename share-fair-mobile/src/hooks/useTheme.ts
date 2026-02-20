import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setTheme } from '../store/slices/uiSlice';
import { storageGet, storageSet } from '../utils/storage';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  const loadTheme = async () => {
    const saved = await storageGet('theme');
    if (saved === 'light' || saved === 'dark') {
      dispatch(setTheme(saved));
    }
  };

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(next));
    await storageSet('theme', next);
  };

  return { theme, toggleTheme, loadTheme };
};
