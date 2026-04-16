import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItem } from "../services/api";

const API_BASE = "http://localhost:3000";

const CONDITION_CONFIG = {
    new: { label: "New", bg: "#003D2B", color: "#00C896" },
    like_new: { label: "Like New", bg: "#002A3A", color: "#38BDF8" },
    good: { label: "Good", bg: "#1A1A00", color: "#FACC15" },
    fair: { label: "Fair", bg: "#2A1A00", color: "#FB923C" },
    poor: { label: "Poor", bg: "#2A0A0A", color: "#FF6B6B" },
};

export default function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getItem(id);
                if (res.data.success) {
                    setItem(res.data.item);
                } else {
                    setError("Failed to load item.");
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    setError("Session expired. Please log in again.");
                } else if (err.response?.status === 404) {
                    setError("Item not found.");
                } else {
                    setError(err.response?.data?.message || "Could not reach the server.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <>
                <style>{`
                    @keyframes shimmer {
                        0%   { background-position: -200% 0; }
                        100% { background-position:  200% 0; }
                    }
                    * { box-sizing: border-box; }
                    body { margin: 0; background: #111111; }
                `}</style>
                <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1" }}>
                    <Header onBack={() => navigate("/feed")} />
                    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
                        <div style={{
                            height: "360px", borderRadius: "16px", background: "linear-gradient(90deg, #222 25%, #2a2a2a 50%, #222 75%)",
                            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginBottom: "24px",
                        }} />
                        <div style={{ height: "24px", width: "60%", borderRadius: "8px", background: "#2A2A2A", marginBottom: "16px" }} />
                        <div style={{ height: "16px", width: "80%", borderRadius: "8px", background: "#222", marginBottom: "12px" }} />
                        <div style={{ height: "16px", width: "45%", borderRadius: "8px", background: "#222" }} />
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <style>{`* { box-sizing: border-box; } body { margin: 0; background: #111111; }`}</style>
                <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1" }}>
                    <Header onBack={() => navigate("/feed")} />
                    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
                        <div style={{
                            background: "#2A0A0A", border: "1px solid #FF6B6B33", borderRadius: "14px",
                            padding: "32px 24px", display: "inline-block",
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: "16px" }}>
                                <circle cx="12" cy="12" r="10" stroke="#FF6B6B" strokeWidth="1.5" />
                                <path d="M12 8v4m0 4h.01" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p style={{ margin: "0 0 12px", fontSize: "15px", color: "#FF6B6B" }}>{error}</p>
                            <button
                                onClick={() => navigate("/feed")}
                                style={{
                                    padding: "8px 20px", borderRadius: "8px", border: "1px solid #FF6B6B33",
                                    background: "transparent", color: "#FF6B6B", fontSize: "13px", cursor: "pointer",
                                }}
                            >
                                Back to Feed
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const condition = CONDITION_CONFIG[item.condition?.toLowerCase()?.replace(/\s+/g, "_")] || CONDITION_CONFIG.fair;
    const hasDiscount = item.originalPrice && item.fairPrice && item.fairPrice < item.originalPrice;
    const discountPct = hasDiscount
        ? Math.round(((item.originalPrice - item.fairPrice) / item.originalPrice) * 100)
        : 0;

    const images = (item.images || []).map((img) =>
        img.startsWith("http") ? img : `${API_BASE}/${img}`
    );

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                * { box-sizing: border-box; }
                body { margin: 0; background: #111111; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1", paddingBottom: "40px" }}>
                <Header onBack={() => navigate("/feed")} title={item.category} />

                <main style={{
                    maxWidth: "900px", margin: "0 auto", padding: "24px 20px",
                    animation: "fadeSlideUp 0.3s ease",
                }}>

                    {/* ─── Image Gallery ──────────────────── */}
                    {images.length > 0 ? (
                        <div style={{ marginBottom: "24px" }}>
                            <div style={{
                                width: "100%", height: "360px", borderRadius: "16px", overflow: "hidden",
                                background: "#1A1A1A", border: "1px solid #2A2A2A", position: "relative",
                            }}>
                                <img
                                    src={images[activeImage]}
                                    alt={item.title}
                                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />

                                {hasDiscount && discountPct > 0 && (
                                    <div style={{
                                        position: "absolute", top: "16px", left: "16px",
                                        background: "#00C896", color: "#111", fontSize: "13px", fontWeight: "700",
                                        padding: "5px 12px", borderRadius: "8px",
                                    }}>
                                        -{discountPct}%
                                    </div>
                                )}

                                <div style={{
                                    position: "absolute", top: "16px", right: "16px",
                                    background: condition.bg, color: condition.color,
                                    fontSize: "12px", fontWeight: "600", padding: "5px 12px",
                                    borderRadius: "8px", border: `1px solid ${condition.color}22`,
                                }}>
                                    {condition.label}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div style={{
                                    display: "flex", gap: "8px", marginTop: "12px", justifyContent: "center",
                                }}>
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            style={{
                                                width: "56px", height: "56px", borderRadius: "10px", overflow: "hidden",
                                                border: i === activeImage ? "2px solid #00C896" : "2px solid #2A2A2A",
                                                background: "#1A1A1A", padding: 0, cursor: "pointer",
                                                opacity: i === activeImage ? 1 : 0.5,
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            width: "100%", height: "240px", borderRadius: "16px", background: "#1A1A1A",
                            border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "24px",
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="3" stroke="#333" strokeWidth="1.5" />
                                <circle cx="8.5" cy="8.5" r="1.5" fill="#333" />
                                <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}

                    {/* ─── Title + Price ──────────────────── */}
                    <div style={{
                        background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px",
                        padding: "24px", marginBottom: "16px",
                    }}>
                        <h1 style={{
                            margin: "0 0 16px", fontSize: "22px", fontWeight: "700", color: "#E8F5F1",
                            lineHeight: "1.35", letterSpacing: "-0.3px",
                        }}>
                            {item.title}
                        </h1>

                        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
                            <span style={{
                                fontSize: "28px", fontWeight: "700", color: "#00C896", letterSpacing: "-0.5px",
                            }}>
                                ₹{item.fairPrice?.toLocaleString("en-IN") ?? "—"}
                            </span>
                            {hasDiscount && (
                                <span style={{ fontSize: "16px", color: "#555", textDecoration: "line-through" }}>
                                    ₹{item.originalPrice.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <InfoChip label="Category" value={item.category} />
                            <InfoChip label="Condition" value={condition.label} accent={condition.color} />
                            <InfoChip label="Purchase Year" value={item.purchaseYear} />
                            <InfoChip label="Status" value={item.status} accent={item.status === "active" ? "#00C896" : "#FB923C"} />
                        </div>
                    </div>

                    {/* ─── Description ──────────────────── */}
                    {item.description && (
                        <div style={{
                            background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px",
                            padding: "24px", marginBottom: "16px",
                        }}>
                            <h2 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Description
                            </h2>
                            <p style={{
                                margin: 0, fontSize: "14px", color: "#BBBFBD", lineHeight: "1.7",
                                whiteSpace: "pre-wrap",
                            }}>
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* ─── Tags ──────────────────── */}
                    {item.tags && item.tags.length > 0 && (
                        <div style={{
                            background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px",
                            padding: "24px", marginBottom: "16px",
                        }}>
                            <h2 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Tags
                            </h2>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {item.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: "12px", color: "#00C896", background: "#003D2B",
                                            padding: "5px 12px", borderRadius: "20px",
                                            border: "1px solid #00C89622", fontWeight: "500",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Contact / Action ──────────────────── */}
                    <div style={{
                        background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "16px",
                        padding: "24px",
                    }}>
                        <button
                            style={{
                                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                                background: "linear-gradient(135deg, #00C896, #00A87A)",
                                color: "#111", fontSize: "15px", fontWeight: "700", cursor: "pointer",
                                transition: "all 0.2s", letterSpacing: "0.3px",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px #00C89644"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            Contact Seller
                        </button>

                        <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#555", textAlign: "center" }}>
                            Listed {item.listedAt ? new Date(item.listedAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            }) : "recently"}
                        </p>
                    </div>

                </main>
            </div>
        </>
    );
}


/* ───────── Sub-components ───────── */

function Header({ onBack, title }) {
    return (
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
                onClick={onBack}
                style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", color: "#E8F5F1",
                    fontSize: "14px", cursor: "pointer", padding: "4px 0",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="#E8F5F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
            </button>

            <span style={{ fontSize: "13px", fontWeight: "600", color: "#00C896", letterSpacing: "0.3px" }}>
                {title || "Item Details"}
            </span>

            <span style={{
                fontSize: "12px", color: "#555", background: "#1A1A1A",
                border: "1px solid #2A2A2A", padding: "4px 10px", borderRadius: "6px",
            }}>
                IIIT Manipur
            </span>
        </header>
    );
}

function InfoChip({ label, value, accent }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: "2px",
            background: "#222", padding: "8px 14px", borderRadius: "10px",
            border: "1px solid #2A2A2A",
        }}>
            <span style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                {label}
            </span>
            <span style={{ fontSize: "13px", color: accent || "#E8F5F1", fontWeight: "600" }}>
                {value}
            </span>
        </div>
    );
}
