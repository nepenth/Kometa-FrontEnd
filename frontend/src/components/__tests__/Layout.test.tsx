import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Layout from '../Layout'
import authReducer from '../../../features/auth/authSlice'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Mock store
const store = configureStore({
    reducer: {
        auth: authReducer
    },
    preloadedState: {
        auth: {
            user: { username: 'testuser', token: 'token' },
            isAuthenticated: true,
            loading: false,
            error: null
        }
    }
})

const theme = createTheme()

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
        )

        expect(screen.getByText('Dashboard')).toBeDefined()
        expect(screen.getByText('Configuration')).toBeDefined()
        expect(screen.getByText('Libraries')).toBeDefined()
        expect(screen.getByText('Collections')).toBeDefined()
        expect(screen.getByText('Scheduler')).toBeDefined()
        expect(screen.getByText('Logs')).toBeDefined()
        expect(screen.getByText('KOMETA')).toBeDefined()
    })
})
