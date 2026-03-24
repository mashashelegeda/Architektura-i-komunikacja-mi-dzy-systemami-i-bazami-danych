import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen p-8">
            <h1>Profile</h1>
            <p>Email: {user?.email}</p>
        </div>
    );
}