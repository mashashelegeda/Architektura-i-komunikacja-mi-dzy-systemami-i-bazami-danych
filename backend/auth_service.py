from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import sqlite3
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = "flyparking-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

DB_PATH = "flyparking.db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS parking_spots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            spot_number TEXT UNIQUE NOT NULL,
            price_per_day REAL DEFAULT 100.0,
            is_available INTEGER DEFAULT 1
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            spot_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM parking_spots")
    if cursor.fetchone()[0] == 0:
        test_spots = [
            ("A1", 100, 1),
            ("A2", 100, 1),
            ("B1", 120, 1),
            ("B2", 120, 1),
            ("C1", 90, 1),
        ]
        cursor.executemany(
            "INSERT INTO parking_spots (spot_number, price_per_day, is_available) VALUES (?, ?, ?)",
            test_spots
        )
    
    conn.commit()
    conn.close()

init_db()

def get_db():
    return sqlite3.connect(DB_PATH)

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_token(email: str, user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {"sub": email, "user_id": user_id, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/register", status_code=201)
def register(user: UserRegister):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(400, "Email już istnieje")
    
    cursor.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (user.name, user.email, hash_password(user.password))
    )
    conn.commit()
    conn.close()
    
    return {"message": "Użytkownik został zarejestrowany pomyślnie"}

@app.post("/auth/login")
def login(user: UserLogin):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user[2]):
        raise HTTPException(401, "Nieprawidłowy email lub hasło")
    
    token = create_token(db_user[1], db_user[0])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user[0],
        "email": db_user[1]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)