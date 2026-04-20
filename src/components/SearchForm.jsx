import React, { useState } from 'react';
export default function SearchForm() {
    const [data, setData] = useState(null);

    const checkAvailability = async () => {
        const res = await fetch("http://127.0.0.1:8000/availability");
        const result = await res.json();
        setData(result);
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
                        <input type="date" className="w-full mt-1 p-3 border rounded-lg" />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Data wyjazdu</label>
                        <input type="date" className="w-full mt-1 p-3 border rounded-lg" />
                    </div>

                    <button onClick={checkAvailability} className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-800 transition">
                        Szukaj parkingu
                    </button>
                    {data && (
                        <div className="mt-4 p-4 bg-white rounded shadow">
                            <p>Iłość dostępnych miejsc: {data.available_spots}</p>
                            <p>Cena za jeden dzień: {data.price_per_day} zł</p>
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