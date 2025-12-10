# 📚 Kometa Web Interface - Comprehensive Documentation

## 📋 Table of Contents
- [Introduction](#introduction)
- [Installation Guide](#installation-guide)
- [Configuration Guide](#configuration-guide)
- [User Guide](#user-guide)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## 🎯 Introduction

Kometa Web Interface is a modern, web-based management system for the Kometa Plex Metadata Manager. It provides a user-friendly interface for managing Plex libraries, collections, overlays, and metadata operations.

### Key Features
- **Visual Configuration Editor**: Edit YAML configurations with syntax highlighting and validation
- **Real-time Monitoring**: Track operation progress and view live logs
- **Collection Management**: Create and manage collections visually
- **Overlay Editor**: Design and apply overlays with preview
- **Error Handling**: Comprehensive error management and recovery options

## 🛠️ Installation Guide

### Prerequisites
- Debian-based LXC container with Plex Media Server
- Python 3.9+
- Node.js 18+
- Minimum 2GB RAM

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/nepenth/Kometa-FrontEnd.git kometa
cd kometa
```

2. **Set up Python virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-web.txt
```

3. **Configure Kometa**
```bash
cp config/config.yml.template config/config.yml
nano config/config.yml
```

4. **Set up authentication**
```bash
cp .env.example .env
nano .env
```

5. **Start the web interface**
```bash
python kometa.py --web
```

## ⚙️ Configuration Guide

### Configuration File Structure
```yaml
# Main configuration structure
libraries:
  Movies:
    type: movie
    collections:
      - Action Movies
      - Comedy Movies
    overlays:
      - Resolution
      - Audio Format

settings:
  global:
    timeout: 180
    verify_ssl: true
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `timeout` | integer | Global timeout in seconds | 180 |
| `verify_ssl` | boolean | Verify SSL certificates | true |
| `log_level` | string | Logging level | info |
| `cache_enabled` | boolean | Enable caching | true |

## 🎬 User Guide

### Dashboard Overview
The dashboard provides an overview of your Plex libraries, recent operations, and system status.

### Configuration Editor
1. **View Configuration**: Browse your current configuration structure
2. **Edit YAML**: Make changes using the built-in YAML editor
3. **Validate**: Check your configuration for errors
4. **Save**: Apply your changes

### Operations Management
1. **Start Operations**: Launch metadata updates and collection builds
2. **Monitor Progress**: Track operation status in real-time
3. **View Logs**: Access detailed operation logs
4. **Error Handling**: Manage and recover from errors

### Collection Management
1. **Create Collections**: Define new collections visually
2. **Edit Collections**: Modify existing collections
3. **Preview**: See how collections will look
4. **Apply**: Save changes to your Plex server

## 🔧 API Documentation

### Authentication
```bash
POST /api/v1/auth/token
{
  "username": "admin",
  "password": "your-password"
}
```

### Configuration Endpoints
```bash
GET /api/v1/config/structure
GET /api/v1/config/content
POST /api/v1/config/validate
POST /api/v1/config/save
```

### Operations Endpoints
```bash
GET /api/v1/operations
POST /api/v1/operations/run
GET /api/v1/operations/{id}/status
GET /api/v1/operations/{id}/logs
```

## 👨‍💻 Development Guide

### Project Structure
```
frontend/
├── src/
│   ├── features/       # Feature modules
│   ├── services/       # API services
│   ├── store/          # Redux store
│   ├── components/     # Shared components
│   └── App.tsx         # Main application
backend/
├── routers/           # API routers
├── modules/           # Core modules
└── kometa.py          # Main entry point
```

### Development Setup
```bash
# Frontend development
cd frontend
npm install
npm run dev

# Backend development
source venv/bin/activate
python kometa.py --web --debug
```

### Testing
```bash
# Run tests
npm test
pytest
```

## ❓ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Authentication failed | Check .env file and credentials |
| Configuration errors | Validate YAML syntax |
| API connection issues | Check network and CORS settings |
| Performance problems | Review performance optimization guide |

### Debugging Tips
1. **Check logs**: `tail -f logs/kometa.log`
2. **Enable debug mode**: `python kometa.py --web --debug`
3. **Validate configuration**: Use the built-in validator
4. **Test API endpoints**: Use Swagger UI at `/api/docs`

## ❔ FAQ

### How do I reset my password?
Edit the `.env` file and update your password, then restart Kometa.

### Can I run Kometa without the web interface?
Yes, use `python kometa.py --run` for CLI mode.

### How do I backup my configuration?
Use the "Configuration Backup" option in the Recovery menu.

### Where are logs stored?
Logs are stored in the `logs/` directory by default.

### How do I update Kometa?
```bash
git pull
pip install -r requirements.txt
npm install
npm run build
```

This comprehensive documentation provides everything you need to install, configure, use, and develop the Kometa Web Interface.