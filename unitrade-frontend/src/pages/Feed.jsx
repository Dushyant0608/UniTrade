import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";

const CATEGORIES = ["All", "Books", "Electronics", "Furniture", "Sports", "General"];

const CONDITION_CONFIG = {
    new: { label: "New", bg: "#003D2B", color: "#00C896" },
    like_new: { label: "Like New", bg: "#002A3A", color: "#38BDF8" },
    good: { label: "Good", bg: "#1A1A00", color: "#FACC15" },
    fair: { label: "Fair", bg: "#2A1A00", color: "#FB923C" },
    poor: { label: "Poor", bg: "#2A0A0A", color: "#FF6B6B" },
};

const TABS = [
    {
        id: "foryou",
        label: "For You",
        endpoint: "/api/feed",
        icon: (active) => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 4.198 1 7.5 1c1.996 0 3.98.9 4.5 2.8C12.52 1.9 14.504 1 16.5 1c3.302 0 6.5 2.199 6.5 6.191 0 4.105-5.37 8.863-11 14.402z"
                    fill={active ? "#00C896" : "none"}
                    stroke={active ? "#00C896" : "#555"}
                    strokeWidth="1.5"
                />
            </svg>
        ),
    },
    {
        id: "explore",
        label: "Explore",
        endpoint: "/api/explore",
        icon: (active) => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={active ? "#00C896" : "#555"} strokeWidth="1.5" />
                <path
                    d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
                    fill={active ? "#00C896" : "none"}
                    stroke={active ? "#00C896" : "#555"}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];

function SkeletonCard() {
    return (
        <div
            style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    height: "180px",
                    background: "linear-gradient(90deg, #222 25%, #2a2a2a 50%, #222 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                }}
            />
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ height: "14px", width: "70%", borderRadius: "6px", background: "#2A2A2A" }} />
                <div style={{ height: "12px", width: "90%", borderRadius: "6px", background: "#222" }} />
                <div style={{ height: "12px", width: "40%", borderRadius: "6px", background: "#222" }} />
                <div style={{ height: "36px", marginTop: "4px", borderRadius: "8px", background: "#2A2A2A" }} />
            </div>
        </div>
    );
}

function ItemCard({ item }) {
    const condition = CONDITION_CONFIG[item.condition] || CONDITION_CONFIG.fair;
    const hasDiscount =
        item.originalPrice && item.fairPrice && item.fairPrice < item.originalPrice;
    const discountPct = hasDiscount
        ? Math.round(((item.originalPrice - item.fairPrice) / item.originalPrice) * 100)
        : 0;

    const imageUrl =
        item.images && item.images.length > 0
            ? item.images[0].startsWith("http")
                ? item.images[0]
                : `${API_BASE}/${item.images[0]}`
            : null;

    return (
        <div
            style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00C896";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2A2A2A";
                e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => {
                // TODO: navigate to /items/:id
                console.log("Item clicked:", item._id);
            }}
        >
            <div
                style={{
                    height: "180px",
                    background: "#111111",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.title}
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

                {hasDiscount && discountPct > 0 && (
                    <div
                        style={{
                            position: "absolute", top: "10px", left: "10px",
                            background: "#00C896", color: "#111111",
                            fontSize: "11px", fontWeight: "700",
                            padding: "3px 8px", borderRadius: "6px", letterSpacing: "0.3px",
                        }}
                    >
                        -{discountPct}%
                    </div>
                )}

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

            <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                <p
                    style={{
                        margin: 0, fontSize: "14px", fontWeight: "600", color: "#E8F5F1",
                        lineHeight: "1.35", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                >
                    {item.title}
                </p>

                {item.description && (
                    <p
                        style={{
                            margin: 0, fontSize: "12px", color: "#777777", lineHeight: "1.5",
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                    >
                        {item.description}
                    </p>
                )}

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "#00C896", letterSpacing: "-0.3px" }}>
                        ₹{item.fairPrice?.toLocaleString("en-IN") ?? "—"}
                    </span>
                    {hasDiscount && (
                        <span style={{ fontSize: "13px", color: "#555", textDecoration: "line-through" }}>
                            ₹{item.originalPrice.toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                    <span
                        style={{
                            fontSize: "11px", color: "#555", background: "#222",
                            padding: "3px 8px", borderRadius: "5px", border: "1px solid #2A2A2A",
                        }}
                    >
                        {item.category}
                    </span>
                    {item.relevanceScore != null && (
                        <span style={{ fontSize: "11px", color: item.isFallback ? "#555" : "#00C896", opacity: item.isFallback ? 0.5 : 0.7 }}>
                            {item.isFallback ? "↺ fallback" : `↑ ${(item.relevanceScore * 100).toFixed(0)}%`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Feed() {
    const [activeTab, setActiveTab] = useState("foryou");
    const cache = useRef({ foryou: null, explore: null });

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const fetchTab = async (tabId) => {
        if (cache.current[tabId]) {
            setItems(cache.current[tabId]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const endpoint = TABS.find((t) => t.id === tabId).endpoint;
        try {
            const res = await axios.get(`${API_BASE}${endpoint}`, { withCredentials: true });
            if (res.data.success) {
                const feedData = res.data.feed ?? res.data.items ?? [];
                cache.current[tabId] = feedData;
                setItems(feedData);
            } else {
                setError("Failed to load feed.");
            }
        } catch (err) {
            setItems([]);
            if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError(err.response?.data?.message || "Could not reach the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSearch("");
        setActiveCategory("All");
        fetchTab(activeTab);
    }, [activeTab]);
    const filtered = items.filter((item) => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
    });

    const currentTab = TABS.find((t) => t.id === activeTab);
    const navigate = useNavigate();

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
        button { cursor: pointer; }
      `}</style>

            <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1", paddingBottom: "80px" }}>

                {/* Top navbar */}
                <header
                    style={{
                        position: "sticky", top: 0, zIndex: 50,
                        background: "#111111cc", backdropFilter: "blur(12px)",
                        borderBottom: "1px solid #1E1E1E",
                        padding: "0 24px", height: "56px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                            style={{
                                width: "28px", height: "28px", background: "#00C896",
                                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
                                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#111" strokeWidth="2" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: "700", fontSize: "16px", color: "#E8F5F1", letterSpacing: "-0.3px" }}>
                            UniTrade
                        </span>
                    </div>

                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#00C896", letterSpacing: "0.3px" }}>
                        {currentTab.label}
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

                {/* Main content */}
                <main
                    key={activeTab}
                    style={{
                        maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 20px",
                        animation: "fadeSlideUp 0.22s ease",
                    }}
                >
                    {/* Context hint banner */}
                    {!loading && !error && (
                        <div
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                marginBottom: "20px", padding: "10px 14px",
                                background: activeTab === "foryou" ? "#003D2B44" : "#0A1A2A44",
                                border: `1px solid ${activeTab === "foryou" ? "#00C89622" : "#38BDF822"}`,
                                borderRadius: "10px",
                            }}
                        >
                            {activeTab === "foryou" ? (
                                <>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#00C896">
                                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 4.198 1 7.5 1c1.996 0 3.98.9 4.5 2.8C12.52 1.9 14.504 1 16.5 1c3.302 0 6.5 2.199 6.5 6.191 0 4.105-5.37 8.863-11 14.402z" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#00C896" }}>
                                        Personalised based on your interests
                                    </span>
                                </>
                            ) : (
                                <>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#38BDF8" strokeWidth="1.5" />
                                        <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#38BDF8" strokeWidth="1" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#38BDF8" }}>
                                        Everything listed on campus
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position: "relative", marginBottom: "16px" }}>
                        <svg
                            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                        >
                            <circle cx="11" cy="11" r="8" stroke="#555" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search items, tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%", padding: "11px 16px 11px 42px",
                                background: "#1A1A1A", border: "1px solid #2A2A2A",
                                borderRadius: "10px", color: "#E8F5F1",
                                fontSize: "14px", outline: "none", transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#00C896")}
                            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                        />
                    </div>

                    {/* Category chips */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: "6px 14px", borderRadius: "20px", border: "1px solid",
                                    borderColor: activeCategory === cat ? "#00C896" : "#2A2A2A",
                                    background: activeCategory === cat ? "#003D2B" : "transparent",
                                    color: activeCategory === cat ? "#00C896" : "#777777",
                                    fontSize: "13px", fontWeight: activeCategory === cat ? "600" : "400",
                                    transition: "all 0.15s",
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Count */}
                    {!loading && !error && (
                        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#555" }}>
                            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
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

                    {/* Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                            : filtered.map((item) => <ItemCard key={item._id} item={item} />)}
                    </div>

                    {/* Empty */}
                    {!loading && !error && filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
                            <svg style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="#777" strokeWidth="1.5" />
                                <path d="M21 21l-4.35-4.35" stroke="#777" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#777" }}>No items found</p>
                            <p style={{ margin: 0, fontSize: "13px" }}>
                                {search ? `No results for "${search}"` : `Nothing listed in ${activeCategory} yet`}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom nav */}
            <nav
                style={{
                    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
                    background: "#111111ee", backdropFilter: "blur(16px)",
                    borderTop: "1px solid #1E1E1E",
                    height: "64px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        background: "#1A1A1A",
                        border: "1px solid #2A2A2A",
                        borderRadius: "16px",
                        padding: "4px",
                        gap: "4px",
                    }}
                >
                    {TABS.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "8px 24px", borderRadius: "12px", border: "none",
                                    background: active ? "#003D2B" : "transparent",
                                    color: active ? "#00C896" : "#555",
                                    fontSize: "13px", fontWeight: active ? "600" : "400",
                                    transition: "all 0.18s",
                                    outline: "none",
                                }}
                            >
                                {tab.icon(active)}
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                    {/* divider */}
                    <div style={{ width: "1px", background: "#2A2A2A", margin: "6px 4px" }} />

                    {/* + button */}
                    <button
                        onClick={() => navigate("/create")}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "40px", height: "40px", borderRadius: "12px", border: "none",
                            background: "#00C896", color: "#111111",
                            fontSize: "20px", fontWeight: "300",
                            transition: "all 0.18s", outline: "none",
                            lineHeight: 1,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                        +
                    </button>
                </div>
            </nav>
        </>
    );
}