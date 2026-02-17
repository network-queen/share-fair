import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from './redux'
import { setTheme } from '../store/slices/uiSlice'

export const useTheme = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
