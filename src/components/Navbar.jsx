import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="flex justify-between items-center p-4 shadow-md bg-white">
            <div className='flex gap-1'>
                <Link to="/" className="text-xl font-bold hover:text-blue-600">
                    FlyParking
                </Link>
                <img className="w-6" src="src/assets/img/airplane.png" alt="Airplane" />
            </div>
            <div className="space-x-4">
                {user ? (
                    <>
                        <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                            Mój profil
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="text-gray-700 hover:text-blue-600"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}