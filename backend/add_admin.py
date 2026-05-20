import sqlite3

conn = sqlite3.connect("flyparking.db")
cursor = conn.cursor()

cursor.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0")
cursor.execute("UPDATE users SET is_admin = 1 WHERE email = 'vitorijka@gmail.com'")

conn.commit()
conn.close()