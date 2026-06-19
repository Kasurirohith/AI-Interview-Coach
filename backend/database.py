import sqlite3

conn = sqlite3.connect(
    "interview.db",
    check_same_thread=False
)

cursor = conn.cursor()

# USERS

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)
""")

# INTERVIEW HISTORY

cursor.execute("""
CREATE TABLE IF NOT EXISTS interview_history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    ats_score INTEGER,
    interview_score INTEGER,
    company TEXT DEFAULT 'General',
    feedback TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# CERTIFICATES

cursor.execute("""
CREATE TABLE IF NOT EXISTS certificates(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()