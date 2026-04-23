import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:3000";
const MAX_IMAGES = 3;

const CATEGORIES = ["Books", "Electronics", "Furniture", "Sports", "General"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const c = {
  bg: "#111111",
  card: "#1A1A1A",
  accent: "#00C896",
  textPrimary: "#E8F5F1",
  textMuted: "#777777",
  border: "#2A2A2A",
  buttonText: "#111111",
  error: "#FF6B6B",
  inputBg: "#161616",
  inputBorder: "#2A2A2A",
};

const inputBase = {
  width: "100%",
  height: "44px",
  padding: "0 14px",
  backgroundColor: c.inputBg,
  border: `1px solid ${c.inputBorder}`,
  borderRadius: "8px",
  color: c.textPrimary,
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const labelStyle = {
  fontSize: "13px",
  color: c.textMuted,
  marginBottom: "6px",
  display: "block",
  fontWeight: 500,
};

const focusRing = (e) => {
  e.target.style.borderColor = c.accent;
  e.target.style.boxShadow = "0 0 0 3px rgba(0,200,150,0.1)";
};
const blurRing = (e) => {
  e.target.style.borderColor = c.inputBorder;
  e.target.style.boxShadow = "none";
};

function TagChip({ tag, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "5px 10px 5px 12px",
        background: hovered ? "#003D2B" : "#002A20",
        border: `1px solid ${hovered ? c.accent : "#00C89633"}`,
        borderRadius: "20px", fontSize: "12px", fontWeight: 500,
        color: c.accent, transition: "all 0.15s", cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tag}
      <button
        onClick={() => onRemove(tag)}
        style={{
          background: "transparent", border: "none", padding: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hovered ? c.accent : "#00C89666", transition: "color 0.15s", lineHeight: 1,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// Each image entry: { id, previewUrl, cloudUrl, uploading, error }
function ImageSlot({ slot, onRemove }) {
  return (
    <div
      style={{
        position: "relative", width: "100%", paddingTop: "100%",
        borderRadius: "10px", overflow: "hidden",
        border: `1px solid ${slot.error ? c.error : c.border}`,
        background: "#111",
      }}
    >
      <img
        src={slot.previewUrl}
        alt="preview"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* uploading overlay */}
      {slot.uploading && (
        <div
          style={{
            position: "absolute", inset: 0, background: "#000000aa",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          <span style={{ width: "20px", height: "20px", border: "2px solid #ffffff33", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          <span style={{ fontSize: "11px", color: "#fff" }}>Uploading...</span>
        </div>
      )}

      {/* error overlay */}
      {slot.error && (
        <div
          style={{
            position: "absolute", inset: 0, background: "#2A000099",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "11px", color: c.error, textAlign: "center", padding: "8px" }}>
            Upload failed
          </span>
        </div>
      )}

      {/* success tick */}
      {!slot.uploading && !slot.error && slot.cloudUrl && (
        <div
          style={{
            position: "absolute", top: "6px", left: "6px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: c.accent, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* remove button */}
      {!slot.uploading && (
        <button
          onClick={() => onRemove(slot.id)}
          style={{
            position: "absolute", top: "6px", right: "6px",
            width: "22px", height: "22px", borderRadius: "50%",
            background: "#000000cc", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function AddImageButton({ onClick, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", paddingTop: "100%", position: "relative",
        borderRadius: "10px", border: `1.5px dashed ${hovered && !disabled ? c.accent : "#333"}`,
        background: hovered && !disabled ? "#003D2B22" : "#111",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "6px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={hovered && !disabled ? c.accent : "#555"} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: "11px", color: hovered && !disabled ? c.accent : "#555" }}>
          Add photo
        </span>
      </div>
    </button>
  );
}

/* ───── Mode chooser card ───── */
function ModeCard({ icon, title, subtitle, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        background: active ? "#0A1A12" : c.card,
        border: `1.5px solid ${active ? c.accent : c.border}`,
        borderRadius: "14px",
        padding: "28px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        boxShadow: active ? "0 0 0 3px rgba(0,200,150,0.08)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: active ? "#003D2B" : "#1E1E1E",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: active ? c.textPrimary : c.textMuted, transition: "color 0.2s" }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: active ? "#6B9B8A" : "#444", lineHeight: 1.5, transition: "color 0.2s" }}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

export default function CreateItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Mode: null = choosing, "sell" or "donate"
  const [mode, setMode] = useState(null);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  // Images
  const [imageSlots, setImageSlots] = useState([]); // array of slot objects

  // Step 2 state (sell mode only)
  const [step, setStep] = useState(1);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [tags, setTags] = useState([]);
  const [customPrice, setCustomPrice] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const removeTag = (tagToRemove) => setTags((prev) => prev.filter((t) => t !== tagToRemove));

  const isDonate = mode === "donate";

  // ── Image handling ──
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Respect max 3 total
    const remaining = MAX_IMAGES - imageSlots.length;
    const toProcess = files.slice(0, remaining);

    // Create preview slots immediately
    const newSlots = toProcess.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      cloudUrl: null,
      uploading: true,
      error: false,
      file,
    }));

    setImageSlots((prev) => [...prev, ...newSlots]);

    // Reset file input so same file can be re-selected if removed
    e.target.value = "";

    // Upload each to Cloudinary
    for (const slot of newSlots) {
      const formData = new FormData();
      formData.append("image", slot.file);

      try {
        const res = await axios.post(`${API_BASE}/api/upload`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          setImageSlots((prev) =>
            prev.map((s) =>
              s.id === slot.id ? { ...s, cloudUrl: res.data.url, uploading: false } : s
            )
          );
        } else {
          setImageSlots((prev) =>
            prev.map((s) =>
              s.id === slot.id ? { ...s, uploading: false, error: true } : s
            )
          );
        }
      } catch {
        setImageSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id ? { ...s, uploading: false, error: true } : s
          )
        );
      }
    }
  };

  const removeImage = (id) => {
    setImageSlots((prev) => {
      const slot = prev.find((s) => s.id === id);
      if (slot?.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  const isAnyUploading = imageSlots.some((s) => s.uploading);
  const uploadedUrls = imageSlots.filter((s) => s.cloudUrl).map((s) => s.cloudUrl);

  // ── Step 1: Submit handler ──
  const handleStep1Submit = async () => {
    // Common validation
    if (!title || !purchaseYear || !category || !condition) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isAnyUploading) {
      setError("Please wait for images to finish uploading.");
      return;
    }

    // ── DONATE MODE: submit directly ──
    if (isDonate) {
      setError("");
      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE}/api/items`,
          {
            title,
            description,
            images: uploadedUrls,
            originalPrice: 0,
            purchaseYear: Number(purchaseYear),
            category,
            condition,
            tags: [],
          },
          { withCredentials: true }
        );
        if (res.data.success && res.data.item) {
          navigate("/my-listings");
        } else {
          setError("Failed to create donation. Try again.");
        }
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError(err.response?.data?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── SELL MODE: get fair price + tags → move to step 2 ──
    if (!originalPrice) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/items`,
        {
          title,
          description,
          images: uploadedUrls,
          originalPrice: Number(originalPrice),
          purchaseYear: Number(purchaseYear),
          category,
          condition,
        },
        { withCredentials: true }
      );
      if (res.data.success && res.data.suggestedPrice != null) {
        setSuggestedPrice(res.data.suggestedPrice);
        setCustomPrice(String(res.data.suggestedPrice));
        setTags(res.data.suggestedTags || []);
        setStep(2);
      } else {
        setError("Could not get a price suggestion. Try again.");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: confirm and list (sell mode only) ──
  const handleListItem = async () => {
    const finalPrice = useCustom ? Number(customPrice) : suggestedPrice;
    if (!finalPrice || finalPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/items`,
        {
          title,
          description,
          images: uploadedUrls,
          originalPrice: Number(originalPrice),
          purchaseYear: Number(purchaseYear),
          category,
          condition,
          fairPrice: finalPrice,
          tags,
        },
        { withCredentials: true }
      );
      if (res.data.success && res.data.item) {
        navigate("/feed");
      } else {
        setError("Failed to create listing. Try again.");
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const discount =
    suggestedPrice && originalPrice
      ? Math.round(((Number(originalPrice) - suggestedPrice) / Number(originalPrice)) * 100)
      : 0;

  // Reset all form state when going back to mode selection
  const handleBackToModeSelect = () => {
    setMode(null);
    setStep(1);
    setTitle("");
    setDescription("");
    setOriginalPrice("");
    setPurchaseYear("");
    setCategory("");
    setCondition("");
    setImageSlots([]);
    setSuggestedPrice(null);
    setTags([]);
    setCustomPrice("");
    setUseCustom(false);
    setError("");
  };

  // Step label for the indicator
  const stepLabels = isDonate
    ? [{ n: 1, label: "Donation Details" }]
    : [{ n: 1, label: "Details" }, { n: 2, label: "Pricing & Tags" }];

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pricePop {
          0%   { transform: scale(0.88); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes chipIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${c.bg}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #3A3A3A; }
        select option { background: #1A1A1A; color: #E8F5F1; }
        button { cursor: pointer; font-family: inherit; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      `}</style>

      <div style={{ minHeight: "100vh", background: c.bg, color: c.textPrimary }}>

        {/* Navbar */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: "56px", background: "#111111dd", backdropFilter: "blur(12px)", borderBottom: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/feed")}>
            <div style={{ width: "28px", height: "28px", background: c.accent, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#111" strokeWidth="2" />
              </svg>
            </div>
            <span style={{ fontWeight: "700", fontSize: "16px", color: c.textPrimary, letterSpacing: "-0.3px" }}>UniTrade</span>
          </div>
          <button
            onClick={() => navigate("/feed")}
            style={{ background: "transparent", border: `1px solid ${c.border}`, color: c.textMuted, padding: "7px 14px", borderRadius: "7px", fontSize: "13px", fontWeight: 500, transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.textPrimary; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textMuted; }}
          >
            ← Feed
          </button>
        </nav>

        {/* Main */}
        <main style={{ maxWidth: "560px", margin: "0 auto", padding: "88px 24px 60px", animation: "fadeSlideUp 0.28s ease" }}>

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.4px", color: c.textPrimary }}>
              {mode === null ? "Create a Listing" : isDonate ? "Donate an Item" : "Sell an Item"}
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: c.textMuted }}>
              {mode === null
                ? "Choose how you'd like to list your item."
                : isDonate
                  ? "Give it away free to the campus community."
                  : "Fill in the details and we'll suggest a fair price."}
            </p>
          </div>

          {/* ── STEP 0: Mode Chooser ── */}
          {mode === null && (
            <div style={{ animation: "fadeSlideUp 0.22s ease" }}>
              <div style={{ display: "flex", gap: "14px" }}>
                <ModeCard
                  onClick={() => { setMode("sell"); setError(""); }}
                  title="Sell It"
                  subtitle="Set a price — we'll suggest a fair deal with our pricing engine"
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="#00C896" strokeWidth="1.5" strokeLinejoin="round" />
                      <circle cx="7" cy="7" r="1.5" fill="#00C896" />
                    </svg>
                  }
                />
                <ModeCard
                  onClick={() => { setMode("donate"); setError(""); }}
                  title="Donate It"
                  subtitle="Give it away free to fellow students in the donation center"
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#00C896" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  }
                />
              </div>
            </div>
          )}

          {/* ── STEP 1+ (mode selected) ── */}
          {mode !== null && (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                {stepLabels.map(({ n, label }, i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: "8px", flex: i === 0 && stepLabels.length > 1 ? "none" : 1 }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0, background: step >= n ? c.accent : "#1E1E1E", color: step >= n ? c.buttonText : c.textMuted, border: `1px solid ${step >= n ? c.accent : c.border}`, transition: "all 0.25s" }}>
                      {step > n ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : n}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: step === n ? 600 : 400, color: step >= n ? c.textPrimary : c.textMuted, whiteSpace: "nowrap" }}>{label}</span>
                    {i === 0 && stepLabels.length > 1 && <div style={{ flex: 1, height: "1px", background: step >= 2 ? c.accent : c.border, margin: "0 4px", transition: "background 0.3s" }} />}
                  </div>
                ))}
              </div>

              {/* Card */}
              <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "14px", padding: "24px" }}>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div style={{ animation: "fadeSlideUp 0.2s ease" }}>

                    {/* Donate mode badge */}
                    {isDonate && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 14px", marginBottom: "20px",
                        background: "#0A1A12", borderRadius: "10px",
                        border: "1px solid #00C89620",
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#00C896" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: "13px", color: c.accent, fontWeight: 500 }}>
                          This item will be listed for free in the Donation Center
                        </span>
                      </div>
                    )}

                    {/* Images */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                        <label style={labelStyle}>Photos</label>
                        <span style={{ fontSize: "11px", color: "#444" }}>
                          {imageSlots.length}/{MAX_IMAGES}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        {imageSlots.map((slot) => (
                          <ImageSlot key={slot.id} slot={slot} onRemove={removeImage} />
                        ))}
                        {imageSlots.length < MAX_IMAGES && (
                          <AddImageButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnyUploading}
                          />
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#444" }}>
                        JPG, PNG or WebP · max 5MB each
                      </p>
                    </div>

                    <div style={{ height: "1px", background: c.border, marginBottom: "20px" }} />

                    <div style={{ marginBottom: "18px" }}>
                      <label style={labelStyle}>Title <span style={{ color: c.error }}>*</span></label>
                      <input type="text" placeholder="e.g. Sony WH-1000XM4" value={title} onChange={(e) => setTitle(e.target.value)} style={inputBase} onFocus={focusRing} onBlur={blurRing} />
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={labelStyle}>Description <span style={{ color: "#333" }}>(optional)</span></label>
                      <textarea
                        placeholder="Briefly describe the item's condition, usage..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        style={{ ...inputBase, height: "auto", padding: "11px 14px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                        onFocus={focusRing} onBlur={blurRing}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                      <div>
                        <label style={labelStyle}>Category <span style={{ color: c.error }}>*</span></label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputBase, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px" }} onFocus={focusRing} onBlur={blurRing}>
                          <option value="" disabled>Select</option>
                          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Condition <span style={{ color: c.error }}>*</span></label>
                        <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ ...inputBase, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px" }} onFocus={focusRing} onBlur={blurRing}>
                          <option value="" disabled>Select</option>
                          {CONDITIONS.map((cond) => <option key={cond} value={cond}>{cond}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Price row — only show original price in sell mode */}
                    <div style={{ display: "grid", gridTemplateColumns: isDonate ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "22px" }}>
                      {!isDonate && (
                        <div>
                          <label style={labelStyle}>Original Price (₹) <span style={{ color: c.error }}>*</span></label>
                          <input type="number" placeholder="2500" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} style={inputBase} onFocus={focusRing} onBlur={blurRing} />
                        </div>
                      )}
                      <div>
                        <label style={labelStyle}>Purchase Year <span style={{ color: c.error }}>*</span></label>
                        <input type="number" placeholder="2023" value={purchaseYear} onChange={(e) => setPurchaseYear(e.target.value)} style={inputBase} min="2000" max={new Date().getFullYear()} onFocus={focusRing} onBlur={blurRing} />
                      </div>
                    </div>

                    {error && (
                      <div style={{ fontSize: "13px", color: c.error, marginBottom: "16px", padding: "10px 14px", background: "#1A0808", border: "1px solid #FF6B6B22", borderRadius: "8px" }}>
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleStep1Submit}
                      disabled={loading || isAnyUploading}
                      style={{ width: "100%", height: "46px", background: loading || isAnyUploading ? "#004D3A" : c.accent, color: c.buttonText, fontWeight: 600, fontSize: "14px", border: "none", borderRadius: "9px", opacity: loading || isAnyUploading ? 0.8 : 1, transition: "background 0.2s, transform 0.1s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                      onMouseEnter={(e) => { if (!loading && !isAnyUploading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {loading ? (
                        <><span style={{ width: "15px", height: "15px", border: "2px solid transparent", borderTop: `2px solid ${c.buttonText}`, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />{isDonate ? "Submitting..." : "Analyzing..."}</>
                      ) : isAnyUploading ? (
                        <><span style={{ width: "15px", height: "15px", border: "2px solid transparent", borderTop: `2px solid ${c.buttonText}`, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Uploading images...</>
                      ) : isDonate ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                          Donate to Campus
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="#111" strokeWidth="2" strokeLinecap="round" /></svg>
                          Get Fair Price
                        </>
                      )}
                    </button>

                    {/* Back to mode selection */}
                    <p style={{ textAlign: "center", margin: "14px 0 0" }}>
                      <button
                        onClick={handleBackToModeSelect}
                        style={{ background: "transparent", border: "none", color: c.textMuted, fontSize: "13px", textDecoration: "underline", cursor: "pointer" }}
                      >
                        ← Change listing type
                      </button>
                    </p>
                  </div>
                )}

                {/* ── STEP 2 (sell mode only) ── */}
                {step === 2 && !isDonate && (
                  <div style={{ animation: "fadeSlideUp 0.22s ease" }}>

                    {/* Item summary */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: "#111", borderRadius: "10px", marginBottom: "20px", border: `1px solid ${c.border}` }}>
                      {uploadedUrls.length > 0 ? (
                        <img src={uploadedUrls[0]} alt="item" style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "#003D2B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: c.accent }}>{category.charAt(0)}</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: c.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: c.textMuted }}>{category} · {condition} · ₹{Number(originalPrice).toLocaleString("en-IN")}</p>
                      </div>
                      <button onClick={() => { setStep(1); setError(""); }} style={{ background: "transparent", border: "none", color: c.textMuted, fontSize: "12px", textDecoration: "underline" }}>Edit</button>
                    </div>

                    {/* Suggested price */}
                    <div style={{ textAlign: "center", padding: "24px 20px", background: "#0A1A12", borderRadius: "12px", border: `1px solid #00C89620`, marginBottom: "20px" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "1.2px" }}>Suggested Fair Price</p>
                      <p style={{ margin: "0 0 10px", fontSize: "38px", fontWeight: 800, color: c.accent, letterSpacing: "-1px", animation: "pricePop 0.35s ease" }}>₹{suggestedPrice?.toLocaleString("en-IN")}</p>
                      {discount > 0 && (
                        <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 600, color: c.accent, background: "#003D2B", padding: "4px 12px", borderRadius: "20px" }}>{discount}% off original</span>
                      )}
                    </div>

                    {/* Tags */}
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                        <label style={labelStyle}>Auto-generated Tags</label>
                        <span style={{ fontSize: "11px", color: "#444" }}>tap × to remove</span>
                      </div>
                      {tags.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {tags.map((tag, i) => (
                            <div key={tag} style={{ animation: `chipIn 0.2s ease ${i * 0.04}s both` }}>
                              <TagChip tag={tag} onRemove={removeTag} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: "13px", color: "#444", margin: 0, fontStyle: "italic" }}>No tags generated — item will be listed without tags.</p>
                      )}
                    </div>

                    <div style={{ height: "1px", background: c.border, margin: "20px 0" }} />

                    {/* Custom price toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", cursor: "pointer", userSelect: "none" }} onClick={() => setUseCustom((v) => !v)}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0, border: `2px solid ${useCustom ? c.accent : c.border}`, background: useCustom ? c.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {useCustom && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ fontSize: "13px", color: c.textMuted }}>Set a custom price instead</span>
                    </div>

                    {useCustom && (
                      <div style={{ marginBottom: "16px", animation: "fadeSlideUp 0.18s ease" }}>
                        <label style={labelStyle}>Your Price (₹)</label>
                        <input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} style={inputBase} min="1" placeholder="Enter your price" onFocus={focusRing} onBlur={blurRing} />
                      </div>
                    )}

                    {error && (
                      <div style={{ fontSize: "13px", color: c.error, marginBottom: "16px", padding: "10px 14px", background: "#1A0808", border: "1px solid #FF6B6B22", borderRadius: "8px" }}>{error}</div>
                    )}

                    <button
                      onClick={handleListItem}
                      disabled={loading}
                      style={{ width: "100%", height: "46px", background: loading ? "#004D3A" : c.accent, color: c.buttonText, fontWeight: 600, fontSize: "14px", border: "none", borderRadius: "9px", opacity: loading ? 0.8 : 1, transition: "background 0.2s, transform 0.1s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {loading ? (
                        <><span style={{ width: "15px", height: "15px", border: "2px solid transparent", borderTop: `2px solid ${c.buttonText}`, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Creating listing...</>
                      ) : (
                        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>List for ₹{useCustom ? Number(customPrice || 0).toLocaleString("en-IN") : suggestedPrice?.toLocaleString("en-IN")}</>
                      )}
                    </button>

                    <p style={{ textAlign: "center", margin: "14px 0 0" }}>
                      <button onClick={() => { setStep(1); setError(""); }} style={{ background: "transparent", border: "none", color: c.textMuted, fontSize: "13px", textDecoration: "underline" }}>
                        ← Back to details
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}