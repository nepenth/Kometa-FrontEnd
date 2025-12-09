import React from 'react';

import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { store } from './store.ts';
import './i18n';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
