import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from './redux';
import { setLanguage } from '../store/slices/uiSlice';

export const useLanguage = () => {
    const { i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const language = useAppSelector((state) => state.ui.language);

    const changeLanguage = useCallback((lang: 'en' | 'uk') => {
        dispatch(setLanguage(lang));
        i18n.changeLanguage(lang);
    }, [dispatch, i18n]);

    const initLanguage = useCallback(() => {
        const saved = (localStorage.getItem('language') as 'en' | 'uk') || 'en';
        i18n.changeLanguage(saved);
        dispatch(setLanguage(saved));
    }, [dispatch, i18n]);

    return { language, changeLanguage, initLanguage };
};
