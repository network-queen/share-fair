import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  language: 'en' | 'uk';
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  language: (localStorage.getItem('language') as 'en' | 'uk') || 'en',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  toggleSidebar,
  setLanguage,
  setTheme,
  addNotification,
  removeNotification,
} = uiSlice.actions;
export default uiSlice.reducer;
