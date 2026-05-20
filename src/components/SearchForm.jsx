import React, { useState } from 'react';

export default function SearchForm() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const checkAvailability = async () => {
        if (!startDate || !endDate) {
            setMessage("Proszę wybrać daty");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = (end - start) / (1000 * 60 * 60 * 24);

        if (days <= 0) {
            setMessage("Data wyjazdu musi być późniejsza niż data przyjazdu");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("http://127.0.0.1:8002/availability");
            const result = await res.json();

            const totalPrice = days * result.price_per_day;
            
            setData(result);
            setMessage(
                `Dostępnych miejsc: ${result.available_spots}\n` +
                `Cena za dzień: ${result.price_per_day} zł\n` +
                `Liczba dni: ${days}\n` +
                `Całkowity koszt: ${totalPrice} zł`
            );
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-stretch">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold leading-snug">
                            Parking przy lotnisku bez stresu
                        </h2>
                        <p className="text-gray-600 mt-3">
                            Sprawdź dostępność miejsc i zarezerwuj parking w kilka sekund.
                        </p>
                    </div>
                    <img
                        src="src/assets/img/cars.jpg"
                        alt="Parking"
                        className="rounded-xl shadow-lg w-full object-cover"
                    />
                </div>

                <div className="bg-gray-200 p-8 rounded-2xl shadow-lg space-y-5 flex flex-col justify-center">
                    <div>
                        <h3 className="text-xl font-bold">
                            Sprawdź dostępność
                        </h3>
                        <p className="text-sm text-gray-500">
                            Wybierz daty i zobacz wolne miejsca
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Data przyjazdu</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full mt-1 p-3 border rounded-lg" 
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Data wyjazdu</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full mt-1 p-3 border rounded-lg" 
                        />
                    </div>

                    <button 
                        onClick={checkAvailability} 
                        disabled={loading}
                        className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-900 transition"
                    >
                        {loading ? "Sprawdzanie..." : "Szukaj parkingu"}
                    </button>

                    {message && (
                        <div className="mt-4 p-4 bg-white rounded shadow whitespace-pre-line">
                            {message}
                        </div>
                    )}

                    {data && !message && (
                        <div className="mt-4 p-4 bg-white rounded shadow">
                            <p>Ilość dostępnych miejsc: <strong>{data.available_spots}</strong></p>
                            <p>Cena za jeden dzień: <strong>{data.price_per_day} zł</strong></p>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">
                        Rezerwacja wymaga konta użytkownika
                    </p>
                </div>
            </div>
        </section>
    );
}