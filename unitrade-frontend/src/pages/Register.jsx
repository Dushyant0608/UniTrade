import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../services/api"

const colors = {
  bg: "#111111",
  card: "#1A1A1A",
  accent: "#00C896",
  textPrimary: "#E8F5F1",
  textMuted: "#777777",
  border: "#2A2A2A",
  buttonText: "#111111",
  error: "#FF6B6B",
}

/* ── pure-CSS eye icons ── */
const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.textMuted}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.textMuted}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/* ── decorative lines element ── */
const DecorativeLines = () => (
  <div
    style={{
      position: "absolute",
      bottom: "15%",
      left: "8%",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
    <div
      style={{
        width: "120px",
        height: "2px",
        backgroundColor: colors.accent,
        opacity: 0.15,
        borderRadius: "1px",
      }}
    />
    <div
      style={{
        width: "80px",
        height: "2px",
        backgroundColor: colors.accent,
        opacity: 0.1,
        borderRadius: "1px",
      }}
    />
    <div
      style={{
        width: "50px",
        height: "2px",
        backgroundColor: colors.accent,
        opacity: 0.07,
        borderRadius: "1px",
      }}
    />
  </div>
)

/* ── listing card component ── */
const listingData = [
  { name: "Sony Earphones WH-1000", category: "electronics", price: "₹1,800", condition: "Good" },
  { name: "Engineering Maths – Sem 3", category: "books", price: "₹120", condition: "Fair" },
  { name: "Firefox Cycle", category: "general", price: "₹3,200", condition: "Like New" },
]

const cardTransforms = [
  { top: "80px", left: "20px", rotate: "-5deg", zIndex: 1 },
  { top: "40px", left: "10px", rotate: "2deg", zIndex: 2 },
  { top: "0px", left: "0px", rotate: "-1deg", zIndex: 3 },
]

const ListingCard = ({ item, pos }) => (
  <div
    style={{
      position: "absolute",
      width: "220px",
      backgroundColor: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: "10px",
      padding: "12px 14px",
      transform: `rotate(${pos.rotate})`,
      top: pos.top,
      left: pos.left,
      zIndex: pos.zIndex,
    }}
  >
    <div style={{ fontSize: "13px", color: colors.textPrimary, fontWeight: 500, marginBottom: "8px" }}>
      {item.name}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <span style={{ fontSize: "10px", backgroundColor: colors.accent, color: colors.buttonText, padding: "2px 6px", borderRadius: "3px", fontWeight: 600 }}>
        {item.category}
      </span>
      <span style={{ fontSize: "11px", color: colors.textMuted }}>{item.condition}</span>
    </div>
    <div style={{ fontSize: "14px", color: colors.accent, fontWeight: 600 }}>{item.price}</div>
  </div>
)

const StackedCards = () => (
  <div style={{ position: "relative", height: "260px", marginTop: "48px" }}>
    {listingData.map((item, i) => (
      <ListingCard key={i} item={item} pos={cardTransforms[i]} />
    ))}
  </div>
)

/* ── signup tag options ── */
const INTEREST_GROUPS = [
  {
    label: "Branch",
    tags: ["CSE", "ECE"],
    mode: "single",
  },
  {
    label: "I'm looking for",
    tags: ["Books", "Electronics", "Furniture", "Sports", "General"],
    mode: "multi",
  },
]

const Register = () => {
  const navigate = useNavigate()

  /* ── step 1 state ── */
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /* ── step 2 state ── */
  const [selectedTags, setSelectedTags] = useState([])

  /* ── shared state ── */
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ── step 1 → step 2 ── */
  const handleNext = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!email.endsWith("@iiitmanipur.ac.in")) {
      setError("Please use your IIIT Manipur email")
      return
    }
    setError("")
    setStep(2)
  }

  /* ── toggle a tag chip ── */
  const toggleTag = (tag, group) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        // Deselect
        return prev.filter((t) => t !== tag)
      }
      if (group.mode === "single") {
        // Remove any other tag from this group, then add the new one
        const others = prev.filter((t) => !group.tags.includes(t))
        return [...others, tag]
      }
      // Multi-select: just add
      return [...prev, tag]
    })
  }

  /* ── final submit (step 2) ── */
  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      await registerUser({ name, email, password, signupTags: selectedTags.map(t => t.toLowerCase()) })
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (step === 1) handleNext()
      else handleSubmit()
    }
  }

  /* ── shared input style ── */
  const inputBase = {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: colors.textPrimary,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  }

  const labelStyle = {
    fontSize: "13px",
    color: colors.textMuted,
    marginBottom: "6px",
    display: "block",
    fontWeight: 400,
  }

  return (
    <div className="flex h-screen w-full" style={{ backgroundColor: colors.bg }}>
      {/* ════════════════════════════════════════════
          LEFT PANEL — 45 %
          ════════════════════════════════════════════ */}
      <div
        className="hidden md:flex flex-col justify-between"
        style={{
          width: "45%",
          minWidth: "45%",
          backgroundColor: colors.bg,
          backgroundImage: `radial-gradient(ellipse at 10% 90%, rgba(0,200,150,0.04) 0%, transparent 60%)`,
          position: "relative",
          padding: "48px 56px",
          overflow: "hidden",
        }}
      >
        {/* wordmark */}
        <div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: colors.textPrimary,
              letterSpacing: "-0.5px",
            }}
          >
            UniTrade
            <span style={{ color: colors.accent }}>.</span>
          </span>
        </div>

        {/* headline + subtext */}
        <div style={{ marginBottom: "auto", marginTop: "auto" }}>
          <h1
            style={{
              color: colors.textPrimary,
              margin: 0,
            }}
          >
            <span style={{ fontSize: "clamp(32px, 3.2vw, 44px)", opacity: 0.6, display: "block", fontWeight: 700, letterSpacing: "-1px" }}>
              Join the
            </span>
            <span style={{ fontSize: "clamp(58px, 5.8vw, 80px)", display: "block", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1 }}>
              <span style={{ color: colors.accent }}>Campus</span>.
            </span>
          </h1>

          <p
            style={{
              marginTop: "28px",
              fontSize: "15px",
              lineHeight: 1.6,
              color: colors.textMuted,
              maxWidth: "340px",
            }}
          >
            The official marketplace for
            <br />
            IIIT Manipur students.
          </p>

          {/* stacked listing cards */}
          <StackedCards />
        </div>

        {/* decorative lines */}
        <DecorativeLines />
      </div>

      {/* ════════════════════════════════════════════
          RIGHT PANEL — 55 %
          ════════════════════════════════════════════ */}
      <div
        className="flex w-full md:w-auto items-center justify-center"
        style={{
          flex: 1,
          backgroundColor: colors.card,
          paddingTop: "0",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "0 28px",
            marginTop: "-6vh",
          }}
        >

          {/* ─────────────────────────────────────────
              STEP 1 — Identity
              ───────────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* heading */}
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                }}
              >
                Create account.
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.textMuted,
                  margin: "0 0 32px 0",
                }}
              >
                Join your IIIT Manipur campus marketplace
              </p>

              {/* step indicator */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
                <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: colors.accent }} />
                <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* ── full name ── */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="register-name" style={labelStyle}>
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={inputBase}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.accent
                    e.target.style.boxShadow = `0 0 0 3px rgba(0,200,150,0.12)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)"
                    e.target.style.boxShadow = "none"
                  }}
                  onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                  onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
                />
              </div>

              {/* ── email ── */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="register-email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@iiitmanipur.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={inputBase}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.accent
                    e.target.style.boxShadow = `0 0 0 3px rgba(0,200,150,0.12)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)"
                    e.target.style.boxShadow = "none"
                  }}
                  onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                  onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
                />
              </div>

              {/* ── password ── */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="register-password" style={labelStyle}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ ...inputBase, paddingRight: "44px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.accent
                      e.target.style.boxShadow = `0 0 0 3px rgba(0,200,150,0.12)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)"
                      e.target.style.boxShadow = "none"
                    }}
                    onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                    onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* ── confirm password ── */}
              <div style={{ marginBottom: "8px" }}>
                <label htmlFor="register-confirm-password" style={labelStyle}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ ...inputBase, paddingRight: "44px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.accent
                      e.target.style.boxShadow = `0 0 0 3px rgba(0,200,150,0.12)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)"
                      e.target.style.boxShadow = "none"
                    }}
                    onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                    onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* ── error ── */}
              {error && (
                <div
                  style={{
                    fontSize: "13px",
                    color: colors.error,
                    marginBottom: "12px",
                    marginTop: "4px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* ── next button ── */}
              <div style={{ marginTop: error ? "0" : "16px" }}>
                <button
                  id="register-next"
                  onClick={handleNext}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: colors.accent,
                    color: colors.buttonText,
                    fontWeight: 600,
                    fontSize: "15px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* ── login link ── */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: colors.textMuted,
                  marginTop: "24px",
                  marginBottom: "0",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: colors.accent,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Login
                </Link>
              </p>
            </>
          )}

          {/* ─────────────────────────────────────────
              STEP 2 — Interests
              ───────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* back + heading */}
              <button
                onClick={() => { setStep(1); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.textMuted,
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "0",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                }}
              >
                Your interests.
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.textMuted,
                  margin: "0 0 24px 0",
                  lineHeight: 1.5,
                }}
              >
                Pick what you're interested in — this helps us personalise your feed from day one.
              </p>

              {/* step indicator */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
                <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: colors.accent }} />
                <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: colors.accent }} />
              </div>

              {/* ── tag groups ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "28px" }}>
                {INTEREST_GROUPS.map((group) => (
                  <div key={group.label}>
                    <span style={{
                      fontSize: "11px",
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontWeight: 600,
                      marginBottom: "10px",
                      display: "block",
                    }}>
                      {group.label}
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {group.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag, group)}
                            style={{
                              padding: "7px 16px",
                              borderRadius: "20px",
                              border: "1px solid",
                              borderColor: isSelected ? colors.accent : "rgba(255,255,255,0.1)",
                              background: isSelected ? "rgba(0,200,150,0.12)" : "transparent",
                              color: isSelected ? colors.accent : colors.textMuted,
                              fontSize: "13px",
                              fontWeight: isSelected ? 600 : 400,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              outline: "none",
                            }}
                          >
                            {isSelected && (
                              <span style={{ marginRight: "4px" }}>✓</span>
                            )}
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* selected count */}
              {selectedTags.length > 0 && (
                <p style={{
                  fontSize: "12px",
                  color: colors.accent,
                  margin: "0 0 16px 0",
                  opacity: 0.7,
                }}>
                  {selectedTags.length} interest{selectedTags.length !== 1 ? "s" : ""} selected
                </p>
              )}

              {/* ── error ── */}
              {error && (
                <div
                  style={{
                    fontSize: "13px",
                    color: colors.error,
                    marginBottom: "12px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* ── submit ── */}
              <button
                id="register-submit"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "44px",
                  backgroundColor: colors.accent,
                  color: colors.buttonText,
                  fontWeight: 600,
                  fontSize: "15px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "12px",
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              {/* ── skip ── */}
              <button
                onClick={() => { setSelectedTags([]); handleSubmit(); }}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "40px",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: colors.textMuted,
                  fontSize: "13px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Skip for now
              </button>
            </>
          )}

        </div>
      </div>

      {/* ── global placeholder color override ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        #register-name::placeholder,
        #register-email::placeholder,
        #register-password::placeholder,
        #register-confirm-password::placeholder {
          color: ${colors.textMuted};
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default Register

