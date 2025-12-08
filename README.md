# Kometa - Plex Metadata Manager with Web Interface

## Overview

This is a forked version of Kometa that adds a web-based management interface while maintaining all the core functionality of the original Plex metadata manager. This version is designed to run within an existing Plex Media Server LXC container on Debian.

## Installation

### Prerequisites

- Existing Debian-based LXC container running Plex Media Server
- Python 3.9 or higher
- Basic Linux command line knowledge

### Step 1: Clone the Repository

```bash
cd /opt  # or your preferred installation directory
git clone https://github.com/nepenth/Kometa-FrontEnd.git kometa
cd kometa
```

### Step 2: Set Up Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Configure Kometa

1. Copy the configuration template:
```bash
cp config/config.yml.template config/config.yml
```

2. Edit the configuration file:
```bash
vi config/config.yml
```

3. Set up your environment variables (optional):
```bash
cp config/.env.template config/.env
vi config/.env
```

### Step 4: Run Kometa

#### Basic Run:
```bash
source venv/bin/activate
python kometa.py --run
```

#### Scheduled Run (runs daily at specified time):
```bash
source venv/bin/activate
python kometa.py --time "05:00"
```

### Step 5: Access the Web Interface

The web interface is now available! Start it with:

```bash
source venv/bin/activate
python kometa.py --web
```

The web interface will be available at:
```
http://your-plex-server:8000
```

#### Web Interface Features Now Available:

- 🎬 **Dashboard**: Overview of your libraries and collections
- ⚙️ **Configuration Editor**: Web-based YAML configuration management
- 🎨 **Collection Manager**: Visual collection creation and management
- 🖼️ **Overlay Editor**: Drag-and-drop overlay configuration
- 📊 **Logs Viewer**: Real-time log viewing and filtering
- ⏰ **Scheduler**: Web-based scheduling interface
- 🔒 **Authentication**: JWT-based secure access
- 🔄 **Real-time Updates**: WebSocket-based live monitoring

#### API Endpoints:
- Authentication: `POST /api/v1/token`
- Configuration: `GET/POST /api/v1/config`
- Operations: `GET/POST /api/v1/operations`
- Status: `GET /api/v1/status`
- WebSocket: `ws://your-plex-server:8000/api/v1/ws`

#### API Documentation:
- Swagger UI: `http://your-plex-server:8000/api/docs`
- ReDoc: `http://your-plex-server:8000/api/redoc`
- OpenAPI JSON: `http://your-plex-server:8000/api/openapi.json`

## Configuration

### Main Configuration File
- Location: `config/config.yml`
- Contains all your Plex server settings, API keys, and collection definitions

### Environment Variables
- Location: `config/.env`
- Optional environment variables for sensitive data

## Usage Examples

### Run specific collections only:
```bash
python kometa.py --run --run-collections "my-collection|another-collection"
```

### Run in test mode (dry run):
```bash
python kometa.py --run --tests
```

### Run with debug logging:
```bash
python kometa.py --run --debug
```

## Web Interface Features (Now Available)

- 🎬 **Dashboard**: Overview of your libraries and collections
- ⚙️ **Configuration Editor**: Web-based YAML configuration management
- 🎨 **Collection Manager**: Visual collection creation and management
- 🖼️ **Overlay Editor**: Drag-and-drop overlay configuration
- 📊 **Logs Viewer**: Real-time log viewing and filtering
- ⏰ **Scheduler**: Web-based scheduling interface
- 🔒 **Authentication**: JWT-based secure access
- 🔄 **Real-time Updates**: WebSocket-based live monitoring

## Documentation

### Project Documentation
- [Phase 1 Project Plan](phase1_project_plan.md) - Foundation and migration planning
- [Phase 1 Implementation Status](phase1_project_plan_status.md) - Phase 1 progress tracking
- [Phase 2 Project Plan](phase2_project_plan.md) - Web interface architecture and design
- [Phase 2 Implementation Tracker](phase2_project_plan_tracker.md) - Web interface progress tracking

### Technical Documentation
- [API Documentation](http://localhost:8000/api/docs) - Interactive API documentation (when running)
- [Configuration Guide](docs/index.md) - Detailed configuration instructions
- [Migration Guide](docs/migration.md) - Docker to LXC migration instructions

### Development Resources
- [Frontend Development Guide](frontend/README.md) - ReactJS frontend development
- [Backend API Guide](api/README.md) - FastAPI backend development
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## Troubleshooting

### Common Issues

**Python version too old:**
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3.9-dev
```

**Missing dependencies:**
```bash
sudo apt install gcc g++ libxml2-dev libxslt-dev libz-dev libjpeg62-turbo-dev zlib1g-dev
```

**Permission issues:**
```bash
chown -R plex:plex /opt/kometa  # Adjust user/group as needed
```

## Updating

```bash
cd /opt/kometa
git pull
source venv/bin/activate
pip install -r requirements.txt
```

## Support

For issues with this forked version, please check:
1. The original Kometa documentation
2. The issues section of this repository
3. The Discord server (link in original docs)

## License

This project is licensed under the same terms as the original Kometa project.