import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import authReducer from './features/auth/authSlice'
import configReducer from './features/config/configSlice'
import operationsReducer from './features/operations/operationsSlice'
import statusReducer from './features/status/statusSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    config: configReducer,
    operations: operationsReducer,
    status: statusReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/logout/fulfilled']
      }
    }),
  devTools: import.meta.env.MODE !== 'production'
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// This is a workaround for the useSelector type
type TypedUseSelectorHook<T> = (selector: (state: T) => any) => any