import { useAppDispatch, useAppSelector } from './redux';
import { setLanguage } from '../store/slices/uiSlice';
import { storageGet, storageSet } from '../utils/storage';
import i18n from '../i18n';

export const useLanguage = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);

  const loadLanguage = async () => {
    const saved = await storageGet('language');
    if (saved === 'en' || saved === 'uk') {
      dispatch(setLanguage(saved));
      await i18n.changeLanguage(saved);
    }
  };

  const changeLanguage = async (lang: 'en' | 'uk') => {
    dispatch(setLanguage(lang));
    await i18n.changeLanguage(lang);
    await storageSet('language', lang);
  };

  return { language, changeLanguage, loadLanguage };
};
