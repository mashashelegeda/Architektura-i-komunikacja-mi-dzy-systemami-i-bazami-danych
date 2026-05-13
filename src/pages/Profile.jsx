import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetch(`http://localhost:8002/reservations/user/${user.id}`)
                .then(res => res.json())
                .then(data => setReservations(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const cancelReservation = async (id) => {
        const res = await fetch(`http://localhost:8002/reservations/${id}`, { method: "DELETE" });
        if (res.ok) {
            setReservations(reservations.filter(r => r.id !== id));
            alert("Anulowano!");
        }
    };

    if (!user) return <div className="text-center py-20">Zaloguj się</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">Mój profil</h1>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                </div>

                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">Moje rezerwacje</h2>
                    
                    {loading ? (
                        <p>Ładowanie...</p>
                    ) : reservations.length === 0 ? (
                        <div className="text-center">
                            <p>Brak rezerwacji</p>
                            <a href="/" className="inline-block mt-3 bg-blue-500 text-white px-4 py-2 rounded">Zarezerwuj</a>
                        </div>
                    ) : (
                        reservations.map(res => (
                            <div key={res.id} className="border rounded-lg p-4 mb-3">
                                <p><strong>Miejsce {res.spot_number}</strong> | {res.start_date} → {res.end_date}</p>
                                <p>{res.total_price} zł | Status: {res.status === 'active' ? 'Aktywna' : 'Anulowana'}</p>
                                {res.status === 'active' && (
                                    <button onClick={() => cancelReservation(res.id)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm">
                                        Anuluj
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}