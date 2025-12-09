import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './features/auth/authSlice';
import configReducer from './features/config/configSlice';
import librariesReducer from './features/libraries/librariesSlice';
import operationsReducer from './features/operations/operationsSlice';
import schedulerReducer from './features/scheduler/schedulerSlice';
import statusReducer from './features/status/statusSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    config: configReducer,
    operations: operationsReducer,
    status: statusReducer,
    scheduler: schedulerReducer,
    libraries: librariesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// This is a workaround for the useSelector type
type TypedUseSelectorHook<T> = (selector: (state: T) => any) => any;
