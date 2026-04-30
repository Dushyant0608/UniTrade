import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyListings, deleteItem, markAsSold } from "../services/api";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;;

const TABS = [
    { id: "active", label: "Active" },
    { id: "sold", label: "Sold" },
    { id: "donated", label: "Donated" },
];

const CONDITION_CONFIG = {
    new: { label: "New", bg: "#003D2B", color: "#00C896" },
    like_new: { label: "Like New", bg: "#002A3A", color: "#38BDF8" },
    good: { label: "Good", bg: "#1A1A00", color: "#FACC15" },
    fair: { label: "Fair", bg: "#2A1A00", color: "#FB923C" },
    poor: { label: "Poor", bg: "#2A0A0A", color: "#FF6B6B" },
};

const STATUS_BADGE = {
    active: { label: "Active", bg: "#003D2B", color: "#00C896" },
    sold: { label: "Sold", bg: "#1A1A00", color: "#FACC15" },
    donated: { label: "Donated", bg: "#0A1A2A", color: "#38BDF8" },
    claimed: { label: "Claimed", bg: "#1A0A2A", color: "#A78BFA" },
    deleted: { label: "Deleted", bg: "#2A0A0A", color: "#FF6B6B" },
};

export default function MyListings() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("active");
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyListings();
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Could not load listings.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleMarkSold = async (itemId) => {
        setActionLoading(itemId);
        try {
            await markAsSold(itemId);
            setItems((prev) =>
                prev.map((item) =>
                    item._id === itemId ? { ...item, status: "sold" } : item
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark as sold.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        setActionLoading(itemId);
        try {
            await deleteItem(itemId);
            setItems((prev) =>
                prev.map((item) =>
                    item._id === itemId ? { ...item, status: "deleted" } : item
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const filtered = items.filter((item) => {
        if (activeTab === "active") return item.status === "active";
        if (activeTab === "sold") return item.status === "sold";
        if (activeTab === "donated") return item.status === "donated" || item.status === "claimed";
        return false;
    });

    const counts = {
        active: items.filter((i) => i.status === "active").length,
        sold: items.filter((i) => i.status === "sold").length,
        donated: items.filter((i) => i.status === "donated" || i.status === "claimed").length,
    };

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                * { box-sizing: border-box; }
                body { margin: 0; background: #111111; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1", paddingBottom: "40px" }}>

                {/* Header */}
                <header
                    style={{
                        position: "sticky", top: 0, zIndex: 50,
                        background: "#111111cc", backdropFilter: "blur(12px)",
                        borderBottom: "1px solid #1E1E1E",
                        padding: "0 24px", height: "56px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                >
                    <button
                        onClick={() => navigate("/feed")}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: "none", border: "none", color: "#E8F5F1",
                            fontSize: "14px", cursor: "pointer", padding: "4px 0",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="#E8F5F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Feed
                    </button>

                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#E8F5F1", letterSpacing: "-0.3px" }}>
                        My Listings
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#777", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user?.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                fontSize: "12px", color: "#FF6B6B", background: "#1A1A1A",
                                border: "1px solid #2A2A2A", padding: "5px 12px", borderRadius: "6px",
                                cursor: "pointer", transition: "all 0.15s", fontWeight: "500",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF6B6B44"; e.currentTarget.style.background = "#2A0A0A"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.background = "#1A1A1A"; }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main
                    style={{
                        maxWidth: "900px", margin: "0 auto", padding: "24px 20px",
                        animation: "fadeSlideUp 0.22s ease",
                    }}
                >
                    {/* Profile summary card */}
                    <div
                        style={{
                            background: "#1A1A1A", border: "1px solid #2A2A2A",
                            borderRadius: "16px", padding: "24px", marginBottom: "24px",
                            display: "flex", alignItems: "center", gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "48px", height: "48px", borderRadius: "14px",
                                background: "linear-gradient(135deg, #00C896, #00A87A)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "20px", fontWeight: "700", color: "#111",
                                flexShrink: 0,
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "600", color: "#E8F5F1" }}>
                                {user?.name}
                            </p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.email}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                            {TABS.map((tab) => (
                                <div key={tab.id} style={{ textAlign: "center" }}>
                                    <p style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: "700", color: "#00C896" }}>
                                        {counts[tab.id]}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        {tab.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "4px" }}>
                        {TABS.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1, padding: "10px 0", borderRadius: "8px",
                                        border: "none", fontSize: "13px", fontWeight: active ? "600" : "400",
                                        background: active ? "#003D2B" : "transparent",
                                        color: active ? "#00C896" : "#777",
                                        cursor: "pointer", transition: "all 0.15s",
                                    }}
                                >
                                    {tab.label} ({counts[tab.id]})
                                </button>
                            );
                        })}
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "#2A0A0A", border: "1px solid #FF6B6B33",
                                borderRadius: "10px", padding: "16px 20px",
                                color: "#FF6B6B", fontSize: "14px", marginBottom: "16px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Loading skeletons */}
                    {loading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: "100px", borderRadius: "14px",
                                        background: "linear-gradient(90deg, #1A1A1A 25%, #222 50%, #1A1A1A 75%)",
                                        backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Listing cards */}
                    {!loading && !error && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {filtered.map((item) => (
                                <ListingCard
                                    key={item._id}
                                    item={item}
                                    actionLoading={actionLoading}
                                    onView={() => navigate(`/items/${item._id}`)}
                                    onMarkSold={() => handleMarkSold(item._id)}
                                    onDelete={() => handleDelete(item._id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <svg style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#777" strokeWidth="1.5" />
                                <path d="M12 8v8m-4-4h8" stroke="#777" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p style={{ margin: "0 0 8px", fontSize: "15px", color: "#777" }}>
                                No {activeTab} listings
                            </p>
                            {activeTab === "active" && (
                                <button
                                    onClick={() => navigate("/create")}
                                    style={{
                                        padding: "10px 24px", borderRadius: "10px", border: "none",
                                        background: "#00C896", color: "#111", fontSize: "14px",
                                        fontWeight: "600", cursor: "pointer", marginTop: "8px",
                                    }}
                                >
                                    List your first item
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}


/* ───────── Listing Card ───────── */

function ListingCard({ item, actionLoading, onView, onMarkSold, onDelete }) {
    const condition = CONDITION_CONFIG[item.condition?.toLowerCase()?.replace(/\s+/g, "_")] || CONDITION_CONFIG.fair;
    const status = STATUS_BADGE[item.status] || STATUS_BADGE.active;
    const isLoading = actionLoading === item._id;

    const imageUrl =
        item.images && item.images.length > 0
            ? item.images[0].startsWith("http") ? item.images[0] : `${API_BASE}/${item.images[0]}`
            : null;

    return (
        <div
            style={{
                background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "14px",
                overflow: "hidden", display: "flex", transition: "border-color 0.2s",
                opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
        >
            {/* Thumbnail */}
            <div
                onClick={onView}
                style={{
                    width: "120px", minHeight: "120px", flexShrink: 0,
                    background: "#111", cursor: "pointer", overflow: "hidden",
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl} alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#333" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="#333" />
                            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Details */}
            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <p
                        onClick={onView}
                        style={{
                            margin: 0, fontSize: "14px", fontWeight: "600", color: "#E8F5F1",
                            cursor: "pointer", flex: 1, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                    >
                        {item.title}
                    </p>
                    <span
                        style={{
                            fontSize: "10px", fontWeight: "600", padding: "3px 8px",
                            borderRadius: "6px", background: status.bg, color: status.color,
                            border: `1px solid ${status.color}22`, flexShrink: 0,
                            textTransform: "uppercase", letterSpacing: "0.3px",
                        }}
                    >
                        {status.label}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#00C896" }}>
                        ₹{item.fairPrice?.toLocaleString("en-IN") ?? "—"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#555", background: "#222", padding: "2px 8px", borderRadius: "5px", border: "1px solid #2A2A2A" }}>
                        {item.category}
                    </span>
                    <span style={{ fontSize: "11px", color: condition.color }}>
                        {condition.label}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "auto" }}>
                    <span style={{ fontSize: "11px", color: "#555" }}>
                        Listed {item.listedAt ? new Date(item.listedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "recently"}
                    </span>

                    <div style={{ flex: 1 }} />

                    {/* Action buttons — only for active items */}
                    {item.status === "active" && (
                        <>
                            <button
                                onClick={onMarkSold}
                                disabled={isLoading}
                                style={{
                                    fontSize: "11px", fontWeight: "600", padding: "5px 12px",
                                    borderRadius: "6px", border: "1px solid #00C89633",
                                    background: "#003D2B", color: "#00C896",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = "#004D35"; } }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#003D2B"; }}
                            >
                                {isLoading ? "..." : "Mark Sold"}
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={isLoading}
                                style={{
                                    fontSize: "11px", fontWeight: "600", padding: "5px 12px",
                                    borderRadius: "6px", border: "1px solid #FF6B6B22",
                                    background: "transparent", color: "#FF6B6B",
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = "#2A0A0A"; } }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
