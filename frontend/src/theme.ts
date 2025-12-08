import { createTheme } from '@mui/material/styles'

// Create a custom theme for Kometa
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a6baf',
      light: '#6a8bcf',
      dark: '#2a4b8f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#6c757d',
      light: '#8c959d',
      dark: '#4c555d',
      contrastText: '#ffffff'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0'
    },
    error: {
      main: '#f44336',
      light: '#f6685e',
      dark: '#aa2e25'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#c77700'
    },
    info: {
      main: '#2196f3',
      light: '#4dabf5',
      dark: '#1769aa'
    },
    success: {
      main: '#4caf50',
      light: '#7bc67e',
      dark: '#377a3a'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.3
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.3
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          minWidth: 'auto'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    }
  },
  shape: {
    borderRadius: 10
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  }
})

export default theme