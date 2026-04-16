import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as loginApi, logoutUser as logoutApi, getMe } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while checking session on mount

    // On mount — check if user has a valid session cookie
    useEffect(() => {
        getMe()
            .then((res) => {
                if (res.data.success) setUser(res.data.user);
            })
            .catch(() => {
                setUser(null); // 401 or network error — not logged in
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        const res = await loginApi(credentials);
        if (res.data.success) {
            setUser(res.data.user);
        }
        return res;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // Even if API fails, clear local state
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
