import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Modal({ setIsOpen }) {
    const { user } = useAuth();
    const [spots, setSpots] = useState([]);
    const [form, setForm] = useState({
        spot_id: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        carNumber: "",
        startDate: "",
        endDate: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSpots();
        if (user?.email) {
            setForm(prev => ({ ...prev, email: user.email }));
        }
    }, []);

    const fetchSpots = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8002/parking-spots");
            const data = await response.json();
            const availableSpots = data.filter(spot => spot.is_available === true);
            setSpots(availableSpots);
        } catch (error) {
            console.error("Error fetching spots:", error);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const calculateDays = () => {
        if (!form.startDate || !form.endDate) return 0;
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        return (end - start) / (1000 * 60 * 60 * 24);
    };

    const getSelectedSpotPrice = () => {
        const selected = spots.find(s => s.id === parseInt(form.spot_id));
        return selected ? selected.price_per_day : 0;
    };

    const totalPrice = calculateDays() * getSelectedSpotPrice();

    const handleSubmit = async () => {
        // Валідація
        if (!form.spot_id) {
            setMessage("Proszę wybrać miejsce parkingowe");
            return;
        }
        if (!form.firstName || !form.lastName) {
            setMessage("Proszę podać imię i nazwisko");
            return;
        }
        if (!form.startDate || !form.endDate) {
            setMessage("Proszę wybrać daty");
            return;
        }

        const days = calculateDays();
        if (days <= 0) {
            setMessage("Data wyjazdu musi być późniejsza niż data przyjazdu");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://127.0.0.1:8002/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spot_id: parseInt(form.spot_id),
                    start_date: form.startDate,
                    end_date: form.endDate,
                    user_id: user?.id || 1 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.detail || "Błąd rezerwacji");
                return;
            }

            setMessage(`Rezerwacja utworzona! Kwota: ${data.total_price} zł`);

            setTimeout(() => setIsOpen(false), 2000);
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-8 rounded-lg w-[450px] relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-2 right-3 text-xl hover:text-gray-600"
                >
                    ✖
                </button>

                <h3 className="text-xl font-bold mb-4">
                    Rezerwacja miejsca
                </h3>

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {message}
                    </div>
                )}

                {}
                <label className="block mb-2 font-semibold">Wybierz miejsce parkingowe:</label>
                <select
                    name="spot_id"
                    value={form.spot_id}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 border rounded"
                >
                    <option value=""> Wybierz </option>
                    {spots.map(spot => (
                        <option key={spot.id} value={spot.id}>
                            {spot.spot_number} - {spot.price_per_day} zł/dzień
                        </option>
                    ))}
                </select>

                <input
                    name="firstName"
                    placeholder="Imię"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="lastName"
                    placeholder="Nazwisko"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="phone"
                    placeholder="Telefon"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="carNumber"
                    placeholder="Numer rejestracyjny"
                    value={form.carNumber}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <p className="text-gray-400">Data przyjazdu:</p>
                <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <p className="text-gray-400">Data wyjazdu:</p>
                <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full mb-4 p-2 border rounded"
                />

                {/* Показати розрахунок вартості */}
                {form.startDate && form.endDate && calculateDays() > 0 && form.spot_id && (
                    <div className="mb-4 p-3 bg-gray-100 rounded">
                        <p>Liczba dni: <strong>{calculateDays()}</strong></p>
                        <p>Cena za dzień: <strong>{getSelectedSpotPrice()} zł</strong></p>
                        <p className="text-lg font-bold">Do zapłaty: <strong>{totalPrice} zł</strong></p>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                    {loading ? "Przetwarzanie..." : "Potwierdź rezerwację"}
                </button>
            </div>
        </div>
    );
}

export default Modal;