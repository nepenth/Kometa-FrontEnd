from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

router = APIRouter()

# Security Configuration
SECRET_KEY = os.getenv("KOMETA_SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("KOMETA_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def load_users_from_env():
    """Load user configuration from environment variables"""
    users_db = {}

    # Load users from environment variables
    # Format: KOMETA_USER_<username>_USERNAME, KOMETA_USER_<username>_PASSWORD, etc.
    env_vars = os.environ
    user_prefixes = [key for key in env_vars.keys() if key.startswith("KOMETA_USER_")]

    for prefix in set(user_prefixes):
        # Extract username from prefix (KOMETA_USER_<username>_*)
        username_part = prefix.replace("KOMETA_USER_", "")
        # Get the username part (everything before the first underscore after KOMETA_USER_)
        username_parts = username_part.split("_", 1)  # Split on first underscore only
        username = username_parts[0]

        # Get the actual username value from the environment variable
        actual_username = env_vars.get(f"KOMETA_USER_{username}_USERNAME")
        if not actual_username:
            continue  # Skip if username is not set

        if actual_username not in users_db:
            users_db[actual_username] = {
                "username": actual_username,
                "full_name": env_vars.get(f"KOMETA_USER_{username}_FULL_NAME", f"Kometa User {actual_username}"),
                "email": env_vars.get(f"KOMETA_USER_{username}_EMAIL", f"{actual_username}@kometa.local"),
                "hashed_password": None,
                "disabled": env_vars.get(f"KOMETA_USER_{username}_DISABLED", "false").lower() == "true"
            }

        # Get password from environment variable
        password = env_vars.get(f"KOMETA_USER_{username}_PASSWORD")
        if password:
            # Hash the password if it's not already hashed
            if not password.startswith("$2b$"):
                # Validate password length before hashing
                if len(password.encode('utf-8')) > 72:
                    raise ValueError(
                        f"Password for user '{actual_username}' is too long ({len(password.encode('utf-8'))} bytes). "
                        f"Bcrypt requires passwords to be 72 bytes or less. "
                        f"Please use a shorter password or truncate it manually."
                    )
                users_db[actual_username]["hashed_password"] = pwd_context.hash(password)
            else:
                users_db[actual_username]["hashed_password"] = password

    return users_db

# Load users from environment variables only
fake_users_db = load_users_from_env()

# If no users are configured, raise an error with helpful instructions
if not fake_users_db:
    raise RuntimeError(
        "No authentication users configured. "
        "Please set up users in your .env file using the format: "
        "KOMETA_USER_<username>_USERNAME, KOMETA_USER_<username>_PASSWORD, etc. "
        "See .env.example for details."
    )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password, hashed_password):
    # Debug information
    print(f"DEBUG: verify_password called with:")
    print(f"  plain_password: '{plain_password}' (length: {len(plain_password)} chars, {len(plain_password.encode('utf-8'))} bytes)")
    print(f"  hashed_password: '{hashed_password[:20]}...' (length: {len(hashed_password)} chars)")
    print(f"  plain_password starts with $2b$: {plain_password.startswith('$2b$')}")

    # Only validate length for plain text passwords, not hashes
    # If the "plain_password" is actually a hash (starts with $2b$), skip length check
    if not plain_password.startswith('$2b$') and len(plain_password.encode('utf-8')) > 72:
        print("DEBUG: Password too long, returning False")
        return False

    print("DEBUG: Calling pwd_context.verify...")
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"DEBUG: Verification result: {result}")
        return result
    except Exception as e:
        print(f"DEBUG: Exception during verification: {e}")
        print(f"DEBUG: Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return False

def get_password_hash(password):
    # bcrypt has a 72-byte limit for plain text passwords
    # Skip validation if this is already a hash (starts with $2b$)
    if not password.startswith('$2b$') and len(password.encode('utf-8')) > 72:
        raise ValueError("Plain text password cannot be longer than 72 bytes for bcrypt hashing")
    return pwd_context.hash(password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username) if token_data.username else None
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
