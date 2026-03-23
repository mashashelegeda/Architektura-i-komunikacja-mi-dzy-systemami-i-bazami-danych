import { useState } from "react";

function Modal({ setIsOpen }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        carNumber: "",
        startDate: "",
        endDate: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        console.log(form);

        // API
        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

            <div className="bg-white p-8 rounded-lg w-[400px] relative">


                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-2 right-3 text-xl"
                >
                    ✖
                </button>

                <h3 className="text-xl font-bold mb-4">
                    Rezerwacja miejsca
                </h3>


                <input
                    name="firstName"
                    placeholder="Imię"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />


                <input
                    name="lastName"
                    placeholder="Nazwisko"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />


                <input
                    name="phone"
                    placeholder="Telefon"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />

                <input
                    name="carNumber"
                    placeholder="Numer rejestracyjny"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />
                <p className="text-gray-400">Data przyjazdu:</p>
                <input
                    type="date"
                    name="startDate"
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                />
                <p className="text-gray-400">Data wyjazdu:</p>
                <input
                    type="date"
                    name="endDate"
                    onChange={handleChange}
                    className="w-full mb-4 p-2 border rounded"
                />


                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 text-white py-2 rounded"
                >
                    Potwierdź rezerwację
                </button>
            </div>
        </div>
    );
}

export default Modal;