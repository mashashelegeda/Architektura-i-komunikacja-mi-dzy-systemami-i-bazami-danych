import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Proszę wypełnić wszystkie pola');
            return;
        }

        if (password !== confirmPassword) {
            setError('Hasła nie są zgodne');
            return;
        }

        if (password.length < 6) {
            setError('Hasło musi mieć co najmniej 6 znaków');
            return;
        }

        const success = register(name, email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Rejestracja nie powiodła się');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Imię i nazwisko</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Jan Kowalski"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="twoj@email.com"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Hasło</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Potwierdź hasło</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                    >
                        Zarejestruj się
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Masz już konto?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}