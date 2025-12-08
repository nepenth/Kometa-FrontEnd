import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
    const navigate = useNavigate()

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 700, color: 'primary.main', opacity: 0.5 }}>
                    404
                </Typography>
                <Typography variant="h4" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Home />}
                    onClick={() => navigate('/')}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </Container>
    )
}

export default NotFound
