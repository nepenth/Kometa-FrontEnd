import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import authReducer from '../../../features/auth/authSlice';
import Layout from '../Layout';

// Mock store
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      user: { username: 'testuser', token: 'token' },
      isAuthenticated: true,
      loading: false,
      error: null,
    },
  },
});

const theme = createTheme();

describe('Layout Component', () => {
  it('renders sidebar items', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Layout>
              <div>Child Content</div>
            </Layout>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Configuration')).toBeDefined();
    expect(screen.getByText('Libraries')).toBeDefined();
    expect(screen.getByText('Collections')).toBeDefined();
    expect(screen.getByText('Scheduler')).toBeDefined();
    expect(screen.getByText('Logs')).toBeDefined();
    expect(screen.getByText('KOMETA')).toBeDefined();
  });
});
