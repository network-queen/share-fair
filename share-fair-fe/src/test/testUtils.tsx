import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import listingReducer from '../store/slices/listingSlice';
import searchReducer from '../store/slices/searchSlice';
import uiReducer from '../store/slices/uiSlice';
import type { RootState } from '../store';

export function createTestStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: {
            auth: authReducer,
            listing: listingReducer,
            search: searchReducer,
            ui: uiReducer,
        },
        preloadedState: preloadedState as any,
    });
}

export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState,
        store = createTestStore(preloadedState),
        route = '/',
        ...renderOptions
    }: {
        preloadedState?: Partial<RootState>;
        store?: ReturnType<typeof createTestStore>;
        route?: string;
    } & Omit<Parameters<typeof render>[1], 'wrapper'> = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={[route]}>
                    {children}
                </MemoryRouter>
            </Provider>
        );
    }
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
