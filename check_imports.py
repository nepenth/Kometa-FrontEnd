import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

try:
    print("Importing routers...")
    from routers import auth
    print("Imported auth")
    from routers import config
    print("Imported config")
    from routers import scheduler
    print("Imported scheduler")
    from routers import logs
    print("Imported logs")
    from routers import libraries
    print("Imported libraries")
    print("All routers imported successfully")
except Exception as e:
    print(f"Failed to import routers: {e}")
    import traceback
    traceback.print_exc()
