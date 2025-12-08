import { createTheme, alpha, PaletteMode } from '@mui/material/styles'

// Premium Theme for Kometa
export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      // Dark Mode Palette
      primary: {
        main: '#6366f1', // Indigo
        light: '#818cf8',
        dark: '#4338ca',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#ec4899', // Pink
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff'
      },
      background: {
        default: '#0f172a', // Slate 900
        paper: '#1e293b'    // Slate 800
      },
      text: {
        primary: '#f8fafc', // Slate 50
        secondary: '#94a3b8' // Slate 400
      },
    } : {
      // Light Mode Palette
      primary: {
        main: '#4f46e5', // Indigo 600
        light: '#6366f1',
        dark: '#4338ca',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#db2777', // Pink 600
        light: '#ec4899',
        dark: '#be185d',
        contrastText: '#ffffff'
      },
      background: {
        default: '#f1f5f9', // Slate 100
        paper: '#ffffff'    // White
      },
      text: {
        primary: '#0f172a', // Slate 900
        secondary: '#475569' // Slate 600
      },
    }),
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#b91c1c'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.025em'
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.025em'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.025em'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#334155 #0f172a' : '#cbd5e1 #f1f5f9',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
            minHeight: 24,
            border: `2px solid ${mode === 'dark' ? '#0f172a' : '#f1f5f9'}`,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: mode === 'dark' ? '#475569' : '#94a3b8',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: mode === 'dark' ? '#475569' : '#94a3b8',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: mode === 'dark' ? '#475569' : '#94a3b8',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease-in-out'
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? alpha('#1e293b', 0.7) : '#ffffff',
          backdropFilter: 'blur(12px)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
          borderRight: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? alpha('#0f172a', 0.8) : alpha('#ffffff', 0.8),
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
          color: mode === 'dark' ? '#fff' : '#0f172a'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha('#6366f1', 0.15),
            '&:hover': {
              backgroundColor: alpha('#6366f1', 0.25),
            }
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: mode === 'dark' ? alpha('#000000', 0.2) : alpha('#ffffff', 0.5),
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            },
          }
        }
      }
    }
  },
  shape: {
    borderRadius: 12
  }
})