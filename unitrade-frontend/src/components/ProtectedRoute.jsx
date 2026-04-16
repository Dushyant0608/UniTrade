import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Still checking session — show a minimal loading screen
    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        border: "3px solid #2A2A2A",
                        borderTopColor: "#00C896",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                    }}
                />
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Not logged in — redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
