import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


export default function Profile() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({
        start_date: "",
        end_date: ""
    });

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
            toast.success("Rezerwacja anulowana!");
        }
    };

    const openEdit = (res) => {
        setEditingId(res.id);

        setEditForm({
            start_date: res.start_date,
            end_date: res.end_date
        });
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const saveEdit = async () => {
        try {
            const res = await fetch(`http://localhost:8002/reservations/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.detail || "Błąd");
                return;
            }

            toast.success("Rezerwacja zaktualizowana!");

            setEditingId(null);

            // refresh
            fetch(`http://localhost:8002/reservations/user/${user.id}`)
                .then(res => res.json())
                .then(data => setReservations(data));

        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return <div className="text-center py-20">Zaloguj się</div>;


    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 max-w-3xl">

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">Mój profil</h1>
                    <p> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                </div>


                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                                    <>
                                        <button
                                            onClick={() => cancelReservation(res.id)}
                                            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Anuluj
                                        </button>

                                        <button
                                            onClick={() => openEdit(res)}
                                            className="mt-2 ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Edytuj datę
                                        </button>
                                    </>
                                )}
                                {editingId === res.id && (
                                    <div className="mt-4 p-3 border rounded bg-gray-50">

                                        <h3 className="font-bold mb-2">Zmień datę rezerwacji</h3>

                                        <label className="text-sm">Data przyjazdu</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={editForm.start_date}
                                            onChange={handleEditChange}
                                            className="w-full mb-2 p-2 border rounded"
                                        />

                                        <label className="text-sm">Data wyjazdu</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={editForm.end_date}
                                            onChange={handleEditChange}
                                            className="w-full mb-3 p-2 border rounded"
                                        />

                                        <button
                                            onClick={saveEdit}
                                            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                        >
                                            Zapisz
                                        </button>

                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="bg-gray-400 text-white px-4 py-2 rounded"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                )}


                            </div>
                        ))

                    )}

                </div>
                <div className="flex justify-center">
                    <Link
                        to="/"
                        className="w-24 h-12 flex items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100 hover:scale-105 transition"
                    >
                        <span className="text-xl">←</span>
                        <p>Powrót</p>
                    </Link>
                </div>

            </div>
        </div>
    );
}