# Kometa - Plex Metadata Manager with Web Interface

## 🎯 Overview

This is a forked version of Kometa that adds a web-based management interface while maintaining all the core functionality of the original Plex metadata manager. This version is **specifically designed to run within an existing Plex Media Server LXC container on Debian**.

## 📋 System Architecture

### Core Components
- **Python Backend**: FastAPI-based REST API with WebSocket support
- **React Frontend**: Modern web interface with Material-UI
- **Plex Integration**: Direct integration with Plex Media Server
- **Metadata Management**: TMDb, TVDb, and other metadata providers

### LXC Container Integration
- Runs alongside existing Plex Media Server
- Shares container resources efficiently
- Minimal performance impact
- Secure isolation within container

## 🛠️ Installation Guide for LXC Container

### ✅ Prerequisites

- **Existing Debian-based LXC container** running Plex Media Server
- **Python 3.9 or higher** (required for Kometa)
- **Node.js 18+** (required for frontend development)
- **Basic Linux command line knowledge**
- **Minimum 2GB RAM** recommended for smooth operation

### 📥 Step 1: Clone the Repository

```bash
# Navigate to your preferred installation directory
cd /opt

# Clone the Kometa repository
git clone https://github.com/nepenth/Kometa-FrontEnd.git kometa

# Enter the project directory
cd kometa
```

### 🐍 Step 2: Set Up Python Virtual Environment

```bash
# Create Python virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip to the latest version
pip install --upgrade pip

# Install core dependencies
pip install -r requirements.txt

# Install web interface dependencies (optional but recommended)
pip install -r requirements-web.txt
```

**Note**: The virtual environment isolates Python dependencies from your system Python, preventing conflicts with Plex Media Server.

### ⚙️ Step 3: Configure Kometa

#### 3.1 Copy Configuration Template
```bash
cp config/config.yml.template config/config.yml
```

#### 3.2 Edit Configuration File
```bash
# Use your preferred editor (nano, vi, vim, etc.)
nano config/config.yml
```

**Minimum Required Configuration**:
- Set `plex.url` to your Plex server URL (typically `http://localhost:32400` in LXC)
- Set `plex.token` with your Plex authentication token
- Set `tmdb.apikey` with your TMDb API key

#### 3.3 Set Up Environment Variables (Optional)
```bash
cp config/.env.template config/.env
nano config/.env
```

**Recommended Environment Variables**:
- `KOMETA_PLEX_URL=http://localhost:32400`
- `KOMETA_PLEX_TOKEN=your-plex-token`
- `KOMETA_TMDB_APIKEY=your-tmdb-api-key`

### 🚀 Step 4: Build and Run Kometa

#### 4.1 Basic Execution (CLI Mode)
```bash
# Activate virtual environment
source venv/bin/activate

# Run Kometa with default settings (CLI mode)
python kometa.py --run
```

#### 4.2 Scheduled Execution (CLI Mode)
```bash
# Activate virtual environment
source venv/bin/activate

# Run daily at 5:00 AM (CLI mode)
python kometa.py --time "05:00"
```

#### 4.3 Test Mode (Dry Run - CLI Mode)
```bash
# Activate virtual environment
source venv/bin/activate

# Test run without making changes (CLI mode)
python kometa.py --run --tests
```

### 🌐 Step 5: Launch Web Interface (Recommended)

```bash
# Activate virtual environment
source venv/bin/activate

# Start web interface on port 8000
python kometa.py --web
```

**Access the Web Interface**:
- **URL**: `http://your-plex-server:8000`
- **Swagger UI**: `http://your-plex-server:8000/api/docs`
- **ReDoc**: `http://your-plex-server:8000/api/redoc`

**Important Notes**:
- The web interface (`--web`) includes ALL functionality of the CLI mode
- You do NOT need to run both CLI and web modes separately
- The web interface provides a graphical way to execute the same operations
- Use `--web` for testing and management, CLI mode for scheduled operations

### 🎨 Step 6: Build Frontend for Production (Optional)

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies (only needed once)
npm install

# Build for production (outputs to ../public)
npm run build
```

**When to Build the Frontend**:
- **Development**: Use `npm run dev` for live development (port 3000)
- **Production**: Use `npm run build` to create optimized static files
- **Testing**: The built-in FastAPI web interface works without frontend build
- **Customization**: Only build frontend if you modify React components

**Frontend Build is NOT Required for Basic Testing**:
- The FastAPI backend includes basic HTML templates
- Frontend build is needed only for advanced UI features
- Start with `--web` to test functionality before building frontend

## 📊 Web Interface Features

### 🎬 Dashboard
- Real-time overview of libraries and collections
- System health monitoring
- Quick access to common operations

### ⚙️ Configuration Editor
- Web-based YAML configuration management
- Syntax highlighting and validation
- Save/load configuration files

### 🎨 Collection Manager
- Visual collection creation and management
- Drag-and-drop interface
- Real-time preview

### 🖼️ Overlay Editor
- Drag-and-drop overlay configuration
- Visual preview of overlays
- Batch operations

### 📊 Logs Viewer
- Real-time log viewing
- Filtering and search capabilities
- Export logs functionality

### ⏰ Scheduler
- Web-based scheduling interface
- Visual calendar view
- Recurring task management

### 🔒 Authentication
- JWT-based secure access
- Role-based permissions
- Session management

### 🔄 Real-time Updates
- WebSocket-based live monitoring
- Instant notifications
- Progress tracking

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/token` | POST | Authentication endpoint |
| `/api/v1/auth/users/me` | GET | Get current user info |
| `/api/v1/config` | GET/POST | Configuration management |
| `/api/v1/operations` | GET/POST | Operations execution |
| `/api/v1/status` | GET | System status |
| `/api/v1/ws` | WebSocket | Real-time updates |

## 🎯 Simple Answer: Just Run the Web Interface!

**YES!** You can simply run the web interface and it will take care of everything:

```bash
# 1. Set up environment (one-time setup)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-web.txt

# 2. Configure (one-time setup)
cp config/config.yml.template config/config.yml
nano config/config.yml  # Set plex.url, plex.token, tmdb.apikey

# 3. Run web interface (this does EVERYTHING)
python kometa.py --web

# 4. Access at http://your-plex-server:8000
```

## 🚫 What You DON'T Need to Do:

- **❌ Don't run CLI mode separately** - Web interface includes all CLI functionality
- **❌ Don't build frontend first** - Web interface works without frontend build
- **❌ Don't run both modes** - Choose either web OR CLI, not both

## ✅ What the Web Interface Does:

- **Runs all Kometa operations** (same as CLI mode)
- **Provides graphical management** (collections, overlays, etc.)
- **Includes API endpoints** (for programmatic access)
- **Shows real-time logs** (monitoring and debugging)
- **Allows configuration editing** (web-based YAML editor)

## 🔄 When to Use CLI Mode Instead:

Only use CLI mode (`python kometa.py --run`) if you want:
- **Scheduled operations** (cron jobs, automated runs)
- **Headless execution** (no GUI needed)
- **Script integration** (call from other scripts)

## 🎯 Bottom Line:

**For testing and normal use:**
```bash
python kometa.py --web  # This is ALL you need!
```

## ❓ Frequently Asked Questions

### Do I need to run both CLI and web modes?
**No!** The web interface (`--web`) includes ALL functionality of the CLI mode. Choose one approach:
- Use `--web` for interactive management and testing
- Use CLI mode (`--run` or `--time`) for scheduled/automated operations

### Do I need to build the frontend first?
**No!** The FastAPI backend includes basic HTML templates that work without frontend build. Frontend build is only needed for:
- Advanced UI features and customization
- Production deployment with optimized assets
- Development of React components

### What's the difference between Step 4 and Step 5?
- **Step 4 (CLI Mode)**: Traditional command-line execution
- **Step 5 (Web Mode)**: Graphical interface with same functionality
- **Step 6 (Frontend Build)**: Optional UI enhancement

## 🔐 Authentication Setup

### Important: No Default Credentials
**Kometa now requires explicit authentication configuration** via `.env` file.
There are **no hardcoded default users** - you must configure at least one user.

### Login Instructions
1. **Access the web interface**: Open your browser to `http://your-plex-server:8000`
2. **Login page**: You'll see a login form
3. **Enter credentials**: Use the default username and password above
4. **Click Login**: You'll be redirected to the dashboard

### Setting Up Your First User

Since there are no default users, you **must** configure at least one user in your `.env` file:

1. **Copy the example file**:
```bash
cp .env.example .env
```

2. **Edit the .env file**:
```bash
nano .env
```

3. **Configure your admin user** (example):
```ini
# Admin user configuration
# IMPORTANT: The username in the variable name (ADMIN) must match the username value
KOMETA_USER_ADMIN_USERNAME=admin
KOMETA_USER_ADMIN_PASSWORD=your-secure-password
KOMETA_USER_ADMIN_FULL_NAME=Kometa Administrator
KOMETA_USER_ADMIN_EMAIL=admin@yourdomain.com
KOMETA_USER_ADMIN_DISABLED=false
```

4. **Generate a strong secret key**:
```bash
openssl rand -hex 32
```

### Generating Password Hashes
**Recommended Method** (using Kometa's virtual environment):

```bash
# Activate Kometa's virtual environment
source venv/bin/activate

# Generate hash using passlib (same library as Kometa)
python3 -c "
from passlib.hash import bcrypt
password = input('Enter password: ')
hashed = bcrypt.hash(password)
print(f'Hashed password: {hashed}')
"
```

**Alternative Method** (if htpasswd available):

```bash
# Use this simple command to generate a bcrypt hash
htpasswd -bnBC 10 "" yourpassword | tr -d ':\n'
```

**Direct bcrypt method** (if needed):

```bash
# Install bcrypt if needed
pip install bcrypt==4.1.3

# Generate hash
python3 -c "
import bcrypt
password = input('Enter password: ')
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f'Hashed password: {hashed.decode(\"utf-8\")}')
"
```

**Important Notes**:
- Passwords are **automatically hashed** when using plaintext in `.env`
- Maximum password length: 72 characters (bcrypt limitation)
- Use strong passwords (minimum 12 characters recommended)

### Adding Additional Users
Add more users to the `fake_users_db` dictionary:

```python
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Kometa Admin",
        "email": "admin@kometa.example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    },
    "user2": {  # Add new user
        "username": "user2",
        "full_name": "Second User",
        "email": "user2@kometa.example.com",
        "hashed_password": "generated_hash_here",
        "disabled": False,
    }
}
```

### Authentication API Endpoints
- **Login**: `POST /api/v1/auth/token` - Get JWT token
- **User Info**: `GET /api/v1/auth/users/me` - Get current user info

### JWT Token Usage
The web interface uses JWT (JSON Web Tokens) for authentication:
1. Login with username/password to get a token
2. Token is stored in the browser's localStorage
3. Token is sent with API requests in the Authorization header
4. Token expires after 30 minutes (configurable)

### Security Best Practices
- ✅ **Use strong passwords** (minimum 12 characters)
- ✅ **Disable unused accounts** by setting `DISABLED=true`
- ✅ **Rotate tokens** periodically
- ✅ **Use HTTPS** in production environments
- ✅ **Keep .env file secure** - never commit to version control

### Troubleshooting Authentication
**Login fails with "Incorrect username or password"**:
- Verify you're using the correct credentials
- Check that the user exists in your `.env` configuration
- Ensure the password is correct (passwords are auto-hashed)

**Token expired**:
- Log out and log back in to get a new token
- Tokens automatically expire after 30 minutes

**401 Unauthorized errors**:
- Make sure you're logged in
- Check that your token is valid
- Try refreshing the page or logging out/in

**No users configured error**:
- Make sure you have created a `.env` file with at least one user
- Check that your environment variables are properly formatted
- **Verify that the username in the variable name matches the username value**
- Restart Kometa after creating/modifying the `.env` file

## 🔐 .env Authentication Configuration

### Environment Variable Setup

Kometa now supports **environment variable-based authentication**, allowing you to configure users without modifying Python code. This is the **recommended approach** for production deployments.

### Step-by-Step Setup

#### 1. Copy the Example File
```bash
cp .env.example .env
```

#### 2. Configure Authentication in .env
Edit the `.env` file and configure your users:

```ini
# Basic authentication settings
KOMETA_SECRET_KEY=your-strong-random-secret-key-here
KOMETA_TOKEN_EXPIRE_MINUTES=30

# Admin user configuration
KOMETA_USER_ADMIN_USERNAME=admin
KOMETA_USER_ADMIN_PASSWORD=your-secure-password
KOMETA_USER_ADMIN_FULL_NAME=Kometa Administrator
KOMETA_USER_ADMIN_EMAIL=admin@yourdomain.com
KOMETA_USER_ADMIN_DISABLED=false

# Additional users (optional)
KOMETA_USER_USER2_USERNAME=user2
KOMETA_USER_USER2_PASSWORD=another-password
KOMETA_USER_USER2_FULL_NAME=Second User
KOMETA_USER_USER2_EMAIL=user2@yourdomain.com
KOMETA_USER_USER2_DISABLED=false
```

#### 3. Generate a Strong Secret Key
For production, generate a strong secret key:
```bash
openssl rand -hex 32
```

#### 4. Restart Kometa
The authentication system will automatically load users from the `.env` file:
```bash
# Restart Kometa to apply changes
source venv/bin/activate
python kometa.py --web
```

### Environment Variable Format

The authentication system uses the following format:
- `KOMETA_USER_<username>_USERNAME` - Username (must match the `<username>` in variable name)
- `KOMETA_USER_<username>_PASSWORD` - Password (auto-hashed)
- `KOMETA_USER_<username>_FULL_NAME` - Full name
- `KOMETA_USER_<username>_EMAIL` - Email address
- `KOMETA_USER_<username>_DISABLED` - `true`/`false`

**Important Format Rules**:
- The `<username>` part in the environment variable name determines the actual username
- `KOMETA_USER_ADMIN_*` creates a user with username "ADMIN" (uppercase)
- `KOMETA_USER_admin_*` creates a user with username "admin" (lowercase)
- **The username value must match the username in the variable name**
- Use consistent case for usernames (recommended: lowercase for simplicity)

**Example of Correct Format**:
```ini
# For username "admin":
KOMETA_USER_ADMIN_USERNAME=admin
KOMETA_USER_ADMIN_PASSWORD=your-password
KOMETA_USER_ADMIN_FULL_NAME=Administrator
KOMETA_USER_ADMIN_EMAIL=admin@example.com
KOMETA_USER_ADMIN_DISABLED=false
```

**Example of Incorrect Format** (will cause errors):
```ini
# ❌ WRONG - username in variable doesn't match username value
KOMETA_USER_ADMIN_USERNAME=nepenthe  # Variable says "ADMIN" but value is "nepenthe"
KOMETA_USER_ADMIN_PASSWORD=password
```

### Password Security

- ✅ **Auto-hashing**: Passwords are automatically hashed using bcrypt
- ✅ **Pre-hashed support**: You can provide bcrypt hashes directly (starting with `$2b$`)
- ✅ **Strong defaults**: Minimum 12 characters recommended
- ✅ **Environment security**: Never commit `.env` to version control

### Important: Required .env Configuration

**Kometa now requires explicit authentication configuration** via `.env` file:
- There are **no hardcoded default users**
- You **must** configure at least one user in your `.env` file

### API Endpoint Correction

**Important**: The authentication endpoint is at:
- **Correct URL**: `POST /api/v1/auth/token`
- **Incorrect URL**: `POST /api/v1/token` (will return 405 error)

Update any frontend code to use the correct endpoint.

## 📋 Usage Examples

### Run Specific Collections Only
```bash
python kometa.py --run --run-collections "my-collection|another-collection"
```

### Run with Debug Logging
```bash
python kometa.py --run --debug
```

### Run Only Metadata Operations
```bash
python kometa.py --run --metadata-only
```

### Run Only Collection Operations
```bash
python kometa.py --run --collections-only
```

## ⚠️ LXC Container Considerations

### Resource Management
- **Memory**: Allocate sufficient memory for both Plex and Kometa
- **CPU**: Kometa is CPU-intensive during metadata processing
- **Storage**: Ensure adequate storage for logs and cache

### Network Configuration
- **Port Conflicts**: Avoid port conflicts with Plex (default: 8000 for Kometa)
- **Firewall Rules**: Configure firewall to allow access to port 8000
- **Reverse Proxy**: Consider using Nginx for SSL termination

### Security Best Practices
- **User Permissions**: Run Kometa as the `plex` user for file access
- **Environment Variables**: Use `.env` file for sensitive data
- **Authentication**: Enable JWT authentication for web interface
- **HTTPS**: Use reverse proxy with SSL for secure access

## 🔄 Updating Kometa

```bash
# Navigate to installation directory
cd /opt/kometa

# Pull latest changes
git pull

# Update dependencies
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-web.txt

# Update frontend (if applicable)
cd frontend
npm install
npm run build
```

## 🐛 Troubleshooting

### Common Issues in LXC Environment

**Python Version Too Old**:
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3.9-dev
```

**Missing Dependencies**:
```bash
sudo apt install gcc g++ libxml2-dev libxslt-dev libz-dev libjpeg62-turbo-dev zlib1g-dev
```

**Permission Issues**:
```bash
chown -R plex:plex /opt/kometa
```

**Port Already in Use**:
```bash
# Check for conflicting services
sudo netstat -tulnp | grep 8000

# Change Kometa port
python kometa.py --web --web-port 8001
```

## 📚 Documentation

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

## 🎯 Best Practices for LXC Deployment

### Performance Optimization
- **Scheduled Runs**: Run during low-usage periods
- **Resource Limits**: Set appropriate CPU/memory limits
- **Caching**: Enable caching for metadata providers
- **Batch Operations**: Process collections in batches

### Monitoring and Maintenance
- **Log Rotation**: Configure log rotation for long-term operation
- **Backup Configuration**: Regularly backup `config/config.yml`
- **Update Regularly**: Keep dependencies updated
- **Monitor Resources**: Use `htop` or similar tools

### Integration with Plex
- **Shared Libraries**: Ensure Kometa has access to Plex libraries
- **Metadata Consistency**: Run Kometa after Plex library scans
- **Permission Alignment**: Match user permissions between services

## 📝 License

This project is licensed under the same terms as the original Kometa project.
