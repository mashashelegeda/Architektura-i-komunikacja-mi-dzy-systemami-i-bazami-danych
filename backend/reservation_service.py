from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from typing import List, Optional

DB_PATH = "flyparking.db"

app = FastAPI(title="FlyParking Reservation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParkingSpot(BaseModel):
    id: int
    spot_number: str
    price_per_day: float
    is_available: bool

class ReservationCreate(BaseModel):
    spot_id: int
    start_date: str
    end_date: str
    user_id: int

class Reservation(BaseModel):
    id: int
    user_id: int
    spot_id: int
    spot_number: Optional[str] = None
    start_date: str
    end_date: str
    total_price: float
    status: str

class ReservationUpdate(BaseModel):
    start_date: str
    end_date: str


def get_db():
    return sqlite3.connect(DB_PATH)


@app.get("/parking-spots")
def get_parking_spots():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, spot_number, price_per_day, is_available 
        FROM parking_spots
    """)
    spots = cursor.fetchall()
    conn.close()
    
    return [
        {"id": s[0], "spot_number": s[1], "price_per_day": s[2], "is_available": bool(s[3])}
        for s in spots
    ]

@app.get("/availability")
def get_availability():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM parking_spots WHERE is_available = 1")
    available_spots = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(price_per_day) FROM parking_spots")
    avg_price = cursor.fetchone()[0] or 100
    
    conn.close()
    
    return {
        "available_spots": available_spots,
        "price_per_day": round(avg_price, 2)
    }

@app.post("/reservations")
def create_reservation(reservation: ReservationCreate):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT price_per_day FROM parking_spots WHERE id = ? AND is_available = 1", 
                   (reservation.spot_id,))
    spot = cursor.fetchone()
    if not spot:
        raise HTTPException(400, "Miejsce niedostępne")

    start = datetime.strptime(reservation.start_date, "%Y-%m-%d")
    end = datetime.strptime(reservation.end_date, "%Y-%m-%d")
    days = (end - start).days
    if days <= 0:
        raise HTTPException(400, "Nieprawidłowe daty")
    
    total_price = days * spot[0]

    cursor.execute("""
        INSERT INTO reservations (user_id, spot_id, start_date, end_date, total_price)
        VALUES (?, ?, ?, ?, ?)
    """, (reservation.user_id, reservation.spot_id, reservation.start_date, 
          reservation.end_date, total_price))
    
    cursor.execute("UPDATE parking_spots SET is_available = 0 WHERE id = ?", (reservation.spot_id,))
    
    conn.commit()
    reservation_id = cursor.lastrowid
    conn.close()
    
    return {"id": reservation_id, "total_price": total_price, "message": "Rezerwacja utworzona"}

@app.get("/reservations/user/{user_id}")
def get_user_reservations(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT r.id, r.user_id, r.spot_id, s.spot_number, r.start_date, r.end_date, r.total_price, r.status
        FROM reservations r
        JOIN parking_spots s ON r.spot_id = s.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    """, (user_id,))
    
    reservations = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": r[0], "user_id": r[1], "spot_id": r[2], "spot_number": r[3],
            "start_date": r[4], "end_date": r[5], "total_price": r[6], "status": r[7]
        }
        for r in reservations
    ]

@app.delete("/reservations/{reservation_id}")
def cancel_reservation(reservation_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT spot_id FROM reservations WHERE id = ? AND status = 'active'", (reservation_id,))
    reservation = cursor.fetchone()
    if not reservation:
        raise HTTPException(404, "Rezerwacja nie istnieje lub już anulowana")

    cursor.execute("UPDATE reservations SET status = 'cancelled' WHERE id = ?", (reservation_id,))

    cursor.execute("UPDATE parking_spots SET is_available = 1 WHERE id = ?", (reservation[0],))
    
    conn.commit()
    conn.close()
    
    return {"message": "Rezerwacja anulowana"}

@app.put("/reservations/{reservation_id}")
def update_reservation(reservation_id: int, update: ReservationUpdate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT spot_id FROM reservations WHERE id = ? AND status = 'active'",
        (reservation_id,)
    )
    reservation = cursor.fetchone()

    if not reservation:
        raise HTTPException(404, "Rezerwacja nie istnieje lub jest anulowana")

    spot_id = reservation[0]

    cursor.execute(
        "SELECT price_per_day FROM parking_spots WHERE id = ?",
        (spot_id,)
    )
    spot = cursor.fetchone()

    if not spot:
        raise HTTPException(404, "Miejsce nie istnieje")

    start = datetime.strptime(update.start_date, "%Y-%m-%d")
    end = datetime.strptime(update.end_date, "%Y-%m-%d")
    days = (end - start).days

    if days <= 0:
        raise HTTPException(400, "Nieprawidłowe daty")

    total_price = days * spot[0]

    cursor.execute("""
        UPDATE reservations
        SET start_date = ?, end_date = ?, total_price = ?
        WHERE id = ?
    """, (update.start_date, update.end_date, total_price, reservation_id))

    conn.commit()
    conn.close()

    return {
        "message": "Rezerwacja zaktualizowana",
        "total_price": total_price
    }

@app.get("/reservations/all")
def get_all_reservations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, r.user_id, u.email, s.spot_number, r.start_date, r.end_date, r.total_price, r.status
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN parking_spots s ON r.spot_id = s.id
        ORDER BY r.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "user_id": r[1], "user_email": r[2], "spot_number": r[3], 
             "start_date": r[4], "end_date": r[5], "total_price": r[6], "status": r[7]} for r in rows]

@app.post("/admin/parking-spots")
def add_parking_spot(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO parking_spots (spot_number, price_per_day) VALUES (?, ?)",
                   (data["spot_number"], data["price_per_day"]))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/admin/parking-spots/{spot_id}")
def update_parking_spot(spot_id: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE parking_spots SET price_per_day = ? WHERE id = ?", (data["price_per_day"], spot_id))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/admin/parking-spots/{spot_id}")
def delete_parking_spot(spot_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM parking_spots WHERE id = ?", (spot_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/admin/reservations/{reservation_id}/cancel")
def admin_cancel_reservation(reservation_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE reservations SET status = 'cancelled' WHERE id = ?", (reservation_id,))
    cursor.execute("UPDATE parking_spots SET is_available = 1 WHERE id = (SELECT spot_id FROM reservations WHERE id = ?)", (reservation_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002, reload=True)