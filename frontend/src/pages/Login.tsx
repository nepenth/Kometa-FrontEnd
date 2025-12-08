import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Container
} from '@mui/material'
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { login, clearError } from '../features/auth/authSlice'

const Login: React.FC = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
        return () => {
            dispatch(clearError())
        }
    }, [isAuthenticated, navigate, dispatch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (username && password) {
            dispatch(login({ username, password }))
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0) 50%)'
            }}
        >
            <Container maxWidth="xs">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                        KOMETA
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sign in to manage your media
                    </Typography>
                </Box>

                <Card sx={{ backdropFilter: 'blur(20px)', bgcolor: 'rgba(30, 41, 59, 0.7)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                margin="normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                autoFocus
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ py: 1.5, fontSize: '1rem' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}

export default Login
