import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Refresh } from '@mui/icons-material'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: 'background.default',
                        p: 3
                    }}
                >
                    <Paper
                        sx={{
                            p: 4,
                            maxWidth: 500,
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Typography variant="h4" color="error" gutterBottom>
                            Oops! Something went wrong.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            We're sorry, but an unexpected error occurred. Please try refreshing the page.
                        </Typography>
                        {this.state.error && (
                            <Box
                                sx={{
                                    mt: 2,
                                    mb: 3,
                                    p: 2,
                                    bgcolor: 'rgba(0,0,0,0.2)',
                                    borderRadius: 1,
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 200
                                }}
                            >
                                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', color: '#ef4444' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </Paper>
                </Box>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
