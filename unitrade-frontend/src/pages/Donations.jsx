import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDonations, claimDonation } from "../services/api";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:3000";

const CONDITION_CONFIG = {
    new: { label: "New", bg: "#003D2B", color: "#00C896" },
    like_new: { label: "Like New", bg: "#002A3A", color: "#38BDF8" },
    good: { label: "Good", bg: "#1A1A00", color: "#FACC15" },
    fair: { label: "Fair", bg: "#2A1A00", color: "#FB923C" },
    poor: { label: "Poor", bg: "#2A0A0A", color: "#FF6B6B" },
};

export default function Donations() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claimingId, setClaimingId] = useState(null);
    const [claimedIds, setClaimedIds] = useState(new Set());
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDonations();
            if (res.data.success) {
                setItems(res.data.items);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Could not load donations.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (itemId) => {
        setClaimingId(itemId);
        try {
            await claimDonation(itemId);
            setClaimedIds((prev) => new Set(prev).add(itemId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to claim item.");
        } finally {
            setClaimingId(null);
        }
    };

    const filtered = items.filter((item) => {
        if (claimedIds.has(item._id)) return false;
        const q = search.toLowerCase();
        return (
            !q ||
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q))
        );
    });

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
                input::placeholder { color: #444; }
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
                        Donation Center
                    </span>

                    <span
                        style={{
                            fontSize: "12px", color: "#555", background: "#1A1A1A",
                            border: "1px solid #2A2A2A", padding: "4px 10px", borderRadius: "6px",
                        }}
                    >
                        IIIT Manipur
                    </span>
                </header>

                <main
                    style={{
                        maxWidth: "1000px", margin: "0 auto", padding: "24px 20px",
                        animation: "fadeSlideUp 0.22s ease",
                    }}
                >
                    {/* Info banner */}
                    {!loading && !error && (
                        <div
                            style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                marginBottom: "20px", padding: "12px 16px",
                                background: "#0A1A2A44", border: "1px solid #38BDF822",
                                borderRadius: "12px",
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontSize: "13px", color: "#38BDF8" }}>
                                Free items donated by fellow students — claim what you need
                            </span>
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position: "relative", marginBottom: "20px" }}>
                        <svg
                            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                        >
                            <circle cx="11" cy="11" r="8" stroke="#555" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search donations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%", padding: "11px 16px 11px 42px",
                                background: "#1A1A1A", border: "1px solid #2A2A2A",
                                borderRadius: "10px", color: "#E8F5F1",
                                fontSize: "14px", outline: "none", transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#38BDF8")}
                            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                        />
                    </div>

                    {/* Count */}
                    {!loading && !error && (
                        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#555" }}>
                            {filtered.length} donation{filtered.length !== 1 ? "s" : ""} available
                            {search ? ` matching "${search}"` : ""}
                        </p>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "#2A0A0A", border: "1px solid #FF6B6B33",
                                borderRadius: "10px", padding: "16px 20px",
                                color: "#FF6B6B", fontSize: "14px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        borderRadius: "14px", overflow: "hidden",
                                        background: "#1A1A1A", border: "1px solid #2A2A2A",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "160px",
                                            background: "linear-gradient(90deg, #222 25%, #2a2a2a 50%, #222 75%)",
                                            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                                        }}
                                    />
                                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <div style={{ height: "14px", width: "70%", borderRadius: "6px", background: "#2A2A2A" }} />
                                        <div style={{ height: "12px", width: "90%", borderRadius: "6px", background: "#222" }} />
                                        <div style={{ height: "36px", borderRadius: "8px", background: "#2A2A2A" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    {!loading && !error && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "16px",
                            }}
                        >
                            {filtered.map((item) => (
                                <DonationCard
                                    key={item._id}
                                    item={item}
                                    isClaiming={claimingId === item._id}
                                    onClaim={() => handleClaim(item._id)}
                                    onView={() => navigate(`/items/${item._id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <svg style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#777" strokeWidth="1.5" />
                            </svg>
                            <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#777" }}>No donations available</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                                {search ? `No results for "${search}"` : "Check back later for new donations"}
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}


/* ───────── Donation Card ───────── */

function DonationCard({ item, isClaiming, onClaim, onView }) {
    const condition = CONDITION_CONFIG[item.condition?.toLowerCase()?.replace(/\s+/g, "_")] || CONDITION_CONFIG.fair;

    const imageUrl =
        item.images && item.images.length > 0
            ? item.images[0].startsWith("http") ? item.images[0] : `${API_BASE}/${item.images[0]}`
            : null;

    const donorName = item.sellerId?.name || "Anonymous";

    return (
        <div
            style={{
                background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "14px",
                overflow: "hidden", display: "flex", flexDirection: "column",
                transition: "border-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#38BDF8";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2A2A2A";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {/* Image */}
            <div
                onClick={onView}
                style={{
                    height: "160px", background: "#111", position: "relative",
                    overflow: "hidden", cursor: "pointer", flexShrink: 0,
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
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#333" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="#333" />
                            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}

                {/* FREE badge */}
                <div
                    style={{
                        position: "absolute", top: "10px", left: "10px",
                        background: "#38BDF8", color: "#0A1A2A",
                        fontSize: "11px", fontWeight: "700",
                        padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.5px",
                    }}
                >
                    FREE
                </div>

                {/* Condition badge */}
                <div
                    style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: condition.bg, color: condition.color,
                        fontSize: "11px", fontWeight: "600",
                        padding: "3px 8px", borderRadius: "6px",
                        border: `1px solid ${condition.color}22`,
                    }}
                >
                    {condition.label}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                <p
                    onClick={onView}
                    style={{
                        margin: 0, fontSize: "14px", fontWeight: "600", color: "#E8F5F1",
                        lineHeight: "1.35", cursor: "pointer",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                >
                    {item.title}
                </p>

                {item.description && (
                    <p
                        style={{
                            margin: 0, fontSize: "12px", color: "#777", lineHeight: "1.5",
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                    >
                        {item.description}
                    </p>
                )}

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#555", background: "#222", padding: "2px 8px", borderRadius: "5px", border: "1px solid #2A2A2A" }}>
                        {item.category}
                    </span>
                    <span style={{ fontSize: "11px", color: "#555" }}>
                        by {donorName}
                    </span>
                </div>

                {/* Claim button */}
                <button
                    onClick={onClaim}
                    disabled={isClaiming}
                    style={{
                        width: "100%", padding: "10px", borderRadius: "10px", border: "none",
                        background: isClaiming
                            ? "#1A2A3A"
                            : "linear-gradient(135deg, #38BDF8, #0EA5E9)",
                        color: isClaiming ? "#555" : "#0A1A2A",
                        fontSize: "13px", fontWeight: "700", cursor: isClaiming ? "not-allowed" : "pointer",
                        transition: "all 0.2s", marginTop: "10px", letterSpacing: "0.3px",
                    }}
                    onMouseEnter={(e) => {
                        if (!isClaiming) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px #38BDF844"; }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    {isClaiming ? "Claiming..." : "Claim This Item"}
                </button>
            </div>
        </div>
    );
}
