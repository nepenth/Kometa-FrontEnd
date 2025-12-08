#!/bin/bash

# Kometa Setup Script for Existing Plex LXC Container
# This script automates the installation and setup of Kometa within an existing
# Debian-based LXC container running Plex Media Server

# Exit on error
set -e

# Function to display colored messages
function echo_error() {
    echo -e "\033[31m[ERROR] $1\033[0m"
}

function echo_info() {
    echo -e "\033[34m[INFO] $1\033[0m"
}

function echo_success() {
    echo -e "\033[32m[SUCCESS] $1\033[0m"
}

function echo_warning() {
    echo -e "\033[33m[WARNING] $1\033[0m"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo_error "This script should be run as root for best results."
    echo_warning "Some operations may require sudo privileges."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Detect installation directory
INSTALL_DIR="/opt/kometa"
echo_info "Using installation directory: $INSTALL_DIR"

# Create installation directory
echo_info "Creating installation directory..."
mkdir -p "$INSTALL_DIR"
chown -R plex:plex "$INSTALL_DIR" || true

# Check Python version
echo_info "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1-2)
if [ -z "$PYTHON_VERSION" ]; then
    echo_error "Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

if [[ "$PYTHON_VERSION" < "3.9" ]]; then
    echo_warning "Python version $PYTHON_VERSION detected. Kometa requires Python 3.9+"
    read -p "Continue with installation? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clone or update the repository
echo_info "Setting up Kometa repository..."
cd "$INSTALL_DIR" || exit 1

if [ -d ".git" ]; then
    echo_info "Updating existing Kometa installation..."
    git pull || {
        echo_error "Failed to update Kometa. Trying fresh clone..."
        cd .. && rm -rf kometa && git clone https://github.com/your-username/Kometa-FrontEnd.git kometa
        cd kometa || exit 1
    }
else
    echo_info "Cloning Kometa repository..."
    git clone https://github.com/your-username/Kometa-FrontEnd.git . || exit 1
fi

# Set up Python virtual environment
echo_info "Setting up Python virtual environment..."
python3 -m venv venv || exit 1

# Activate virtual environment and install dependencies
echo_info "Installing Python dependencies..."
source venv/bin/activate || exit 1
pip install --upgrade pip || exit 1
pip install -r requirements.txt || exit 1

# Check if web interface requirements file exists and install if requested
if [ -f "requirements-web.txt" ]; then
    read -p "Do you want to install web interface dependencies? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo_info "Installing web interface dependencies..."
        pip install -r requirements-web.txt || exit 1
        echo_success "Web interface dependencies installed!"
    else
        echo_info "Skipping web interface dependencies"
    fi
else
    echo_warning "Web interface requirements file not found, skipping"
fi

# Create configuration directory
echo_info "Setting up configuration..."
mkdir -p config
chown -R plex:plex config

# Copy configuration template if it doesn't exist
if [ ! -f "config/config.yml" ]; then
    echo_info "Creating default configuration..."
    cp config/config.yml.template config/config.yml || exit 1
    chown plex:plex config/config.yml
    chmod 640 config/config.yml
else
    echo_info "Configuration file already exists"
fi

# Create environment file if it doesn't exist
if [ ! -f "config/.env" ]; then
    echo_info "Creating environment file..."
    cat > config/.env << 'EOF'
# Kometa Environment Variables
# Edit this file to set your environment variables

# Plex configuration (REQUIRED)
# KOMETA_PLEX_URL=http://localhost:32400
# KOMETA_PLEX_TOKEN=your-plex-token

# TMDb API key (REQUIRED)
# KOMETA_TMDB_APIKEY=your-tmdb-api-key

# Other optional services - uncomment and configure as needed
# KOMETA_TAUTULLI_URL=http://localhost:8181
# KOMETA_TAUTULLI_APIKEY=your-tautulli-api-key
# KOMETA_RADARR_URL=http://localhost:7878
# KOMETA_RADARR_TOKEN=your-radarr-token
# KOMETA_SONARR_URL=http://localhost:8989
# KOMETA_SONARR_TOKEN=your-sonarr-token
EOF
    chown plex:plex config/.env
    chmod 640 config/.env
else
    echo_info "Environment file already exists"
fi

# Create data directory for web frontend (future use)
echo_info "Preparing for web frontend..."
mkdir -p frontend
mkdir -p frontend/public
mkdir -p frontend/src
chown -R plex:plex frontend

# Create basic frontend structure
cat > frontend/package.json << 'EOF'
{
  "name": "kometa-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "@mui/material": "^5.15.10",
    "@mui/icons-material": "^5.15.10",
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@types/node": "^20.12.7",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1"
  }
}
EOF

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: '../public',
    emptyOutDir: true
  }
})
EOF

# Create basic frontend files
cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat > frontend/src/App.tsx << 'EOF'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box, Button, Drawer, List, ListItem, ListItemText } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kometa Web Interface
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem button component={Link} to="/" onClick={toggleDrawer}>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/config" onClick={toggleDrawer}>
              <ListItemText primary="Configuration" />
            </ListItem>
            <ListItem button component={Link} to="/collections" onClick={toggleDrawer}>
              <ListItemText primary="Collections" />
            </ListItem>
            <ListItem button component={Link} to="/logs" onClick={toggleDrawer}>
              <ListItemText primary="Logs" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/config" element={<ConfigEditor />} />
          <Route path="/collections" element={<CollectionsManager />} />
          <Route path="/logs" element={<LogsViewer />} />
        </Routes>
      </Container>
    </Router>
  )
}

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Kometa Dashboard</Typography>
      <Typography paragraph>Welcome to the Kometa Web Interface</Typography>
      <Typography paragraph>This interface allows you to manage your Plex metadata and collections through a web browser.</Typography>
    </Box>
  )
}

function ConfigEditor() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Configuration Editor</Typography>
      <Typography paragraph>Edit your Kometa configuration here.</Typography>
    </Box>
  )
}

function CollectionsManager() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Collections Manager</Typography>
      <Typography paragraph>Manage your Plex collections here.</Typography>
    </Box>
  )
}

function LogsViewer() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Logs Viewer</Typography>
      <Typography paragraph>View Kometa operation logs in real-time.</Typography>
    </Box>
  )
}

export default App
EOF

cat > frontend/src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300,400,500,700&display=swap');

body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  padding: 20px;
}
EOF

# Create a simple backend API server (placeholder)
echo_info "Setting up backend API structure..."
mkdir -p api
chown -R plex:plex api

cat > api/server.py << 'EOF'
#!/usr/bin/env python3
"""
Kometa Web API Server
This will serve as the backend API for the React frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys

# Add parent directory to Python path to import kometa modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(title="Kometa Web API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Kometa Web API - Welcome!"}

@app.get("/api/status")
async def get_status():
    return {
        "status": "running",
        "version": "1.0.0",
        "environment": "development"
    }

@app.get("/api/config")
async def get_config():
    # This will be implemented to read the YAML config
    return {"message": "Config endpoint - to be implemented"}

@app.post("/api/run")
async def run_kometa():
    # This will execute kometa.py with appropriate parameters
    return {"message": "Run endpoint - to be implemented"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

chmod +x api/server.py
chown plex:plex api/server.py

# Create a comprehensive setup summary
echo_success "Kometa setup completed successfully!"
echo ""
echo "Setup Summary:"
echo "============="
echo "Installation Directory: $INSTALL_DIR"
echo "Python Virtual Environment: $INSTALL_DIR/venv"
echo "Configuration: $INSTALL_DIR/config/config.yml"
echo "Environment File: $INSTALL_DIR/config/.env"
echo "Frontend Directory: $INSTALL_DIR/frontend"
echo "API Server: $INSTALL_DIR/api/server.py"
echo ""
echo "Next Steps:"
echo "1. Edit $INSTALL_DIR/config/config.yml with your Plex settings"
echo "2. Edit $INSTALL_DIR/config/.env with your API keys"
echo "3. Activate virtual environment: source $INSTALL_DIR/venv/bin/activate"
echo "4. Run Kometa: python kometa.py --run"
echo "5. For web interface: python kometa.py --web"
echo "6. For frontend development: cd frontend && npm install && npm run dev"
echo ""
echo "Documentation:"
echo "- README.md contains installation and usage instructions"
echo "- phase1_project_plan.md contains the complete project plan"
echo "- phase1_project_plan_status.md tracks implementation progress"
echo "- phase2_project_plan.md contains web interface architecture"
echo "- phase2_project_plan_tracker.md tracks web interface progress"
echo ""
echo "Kometa is now ready to use within your existing Plex LXC container!"