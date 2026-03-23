import { useState } from "react";
import heroImg from '../assets/img/heroImg.jpg';
import Modal from "./Modal";

export default function Hero() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <section
                className="text-center py-20 mt-16 relative"
                style={{
                    backgroundImage: `url(${heroImg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 container mx-auto px-4 bg-white w-1/2 rounded-lg p-10">
                    <h2 className="text-4xl font-bold mb-4">
                        Zarezerwuj miejsce parkingowe przy lotnisku
                    </h2>

                    <p className="mb-6 text-gray-600">
                        Szybko i wygodnie zaparkuj swój samochód
                    </p>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded"
                    >
                        Rezerwuj
                    </button>
                </div>
            </section>

            {isOpen && <Modal setIsOpen={setIsOpen} />}
        </>
    );
}