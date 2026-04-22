import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = "http://localhost:8001";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Error loading user:", e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.detail || "Błąd logowania");
                return false;
            }
            
            const userData = { email: data.email, id: data.user_id };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            alert("Nie można połączyć się z serwerem");
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.detail || "Błąd rejestracji");
                return false;
            }
            
            const loginSuccess = await login(email, password);
            return loginSuccess;
        } catch (error) {
            console.error("Register error:", error);
            alert("Nie można połączyć się z serwerem");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}