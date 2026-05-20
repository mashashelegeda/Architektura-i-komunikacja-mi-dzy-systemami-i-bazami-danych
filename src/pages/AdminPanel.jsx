import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
    const { user } = useAuth();
    const [spots, setSpots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [newSpot, setNewSpot] = useState("");
    const [newPrice, setNewPrice] = useState(100);

    if (!user?.is_admin) {
        return <div className="text-center py-20 text-red-500">Brak dostępu. Tylko dla administratorów.</div>;
    }

    useEffect(() => {
        fetch("http://localhost:8002/parking-spots")
            .then(res => res.json())
            .then(setSpots);
        
        fetch("http://localhost:8002/reservations/all")
            .then(res => res.json())
            .then(setReservations);
    }, []);

    const addSpot = async () => {
        if (!newSpot) return;
        await fetch("http://localhost:8002/admin/parking-spots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ spot_number: newSpot, price_per_day: newPrice })
        });
        setNewSpot("");
        fetch("http://localhost:8002/parking-spots").then(res => res.json()).then(setSpots);
    };

    const deleteSpot = async (id) => {
        if (!confirm("Czy na pewno chcesz usunąć to miejsce?")) return;
        await fetch(`http://localhost:8002/admin/parking-spots/${id}`, { method: "DELETE" });
        fetch("http://localhost:8002/parking-spots").then(res => res.json()).then(setSpots);
    };

    const updatePrice = async (id, price) => {
        await fetch(`http://localhost:8002/admin/parking-spots/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price_per_day: price })
        });
    };

    const cancelRes = async (id) => {
        if (!confirm("Czy na pewno chcesz anulować tę rezerwację?")) return;
        await fetch(`http://localhost:8002/admin/reservations/${id}/cancel`, { method: "PUT" });
        fetch("http://localhost:8002/reservations/all").then(res => res.json()).then(setReservations);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Panel Administratora</h1>

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="text-xl font-bold mb-3">+ Dodaj nowe miejsce</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Numer (np. D1)"
                            value={newSpot}
                            onChange={(e) => setNewSpot(e.target.value)}
                            className="border p-2 rounded flex-1"
                        />
                        <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(Number(e.target.value))}
                            className="border p-2 rounded w-28"
                        />
                        <button onClick={addSpot} className="bg-green-500 text-white px-4 py-2 rounded">Dodaj</button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="text-xl font-bold mb-3">Miejsca parkingowe</h2>
                    {spots.map(spot => (
                        <div key={spot.id} className="flex justify-between items-center border-b py-2">
                            <div>
                                <span className="font-bold">{spot.spot_number}</span>
                                <span className="ml-4 text-gray-600">{spot.price_per_day} zł</span>
                                <span className={`ml-4 text-sm ${spot.is_available ? "text-green-600" : "text-red-600"}`}>
                                    {spot.is_available ? "wolne" : "zajęte"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    defaultValue={spot.price_per_day}
                                    onBlur={(e) => updatePrice(spot.id, Number(e.target.value))}
                                    className="border p-1 rounded w-20 text-center"
                                />
                                <button onClick={() => deleteSpot(spot.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Usuń</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-3">Wszystkie rezerwacje</h2>
                    {reservations.length === 0 ? (
                        <p className="text-gray-500">Brak rezerwacji</p>
                    ) : (
                        reservations.map(res => (
                            <div key={res.id} className="border rounded p-3 mb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p><strong>{res.user_email || res.user_id}</strong> | miejsce {res.spot_number}</p>
                                        <p className="text-sm text-gray-600">{res.start_date} → {res.end_date} | {res.total_price} zł</p>
                                        <p>Status: {res.status === "active" ? "Aktywna" : "Anulowana"}</p>
                                    </div>
                                    {res.status === "active" && (
                                        <button onClick={() => cancelRes(res.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Anuluj</button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}