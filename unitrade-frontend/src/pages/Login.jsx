const params = new URLSearchParams(window.location.search);
const isVerified = params.get("verified") === "true";
const isInvalidToken = params.get("error") === "invalid_token";

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { loginUser } from "../services/api"

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

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setLoading(true)
    setError("")
    try {
      await loginUser({ email, password })
      navigate("/feed")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
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
              Trade Smart.
            </span>
            <span style={{ fontSize: "clamp(58px, 5.8vw, 80px)", display: "block", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1 }}>
              Buy <span style={{ color: colors.accent }}>Campus</span>.
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
          /* push form ~10% above center */
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            padding: "0 28px",
            /* offset upward */
            marginTop: "-10vh",
          }}
        >
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
            Welcome back.
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: colors.textMuted,
              margin: "0 0 36px 0",
            }}
          >
            Sign in to your IIIT Manipur account
          </p>

          {/* ── email ── */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="login-email" style={labelStyle}>
              Email
            </label>
            <input
              id="login-email"
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
          <div style={{ marginBottom: "8px" }}>
            <label htmlFor="login-password" style={labelStyle}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
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

          {/* ── error ── */}
          {isVerified && (
            <div style={{ fontSize: "13px", color: colors.accent, marginBottom: "12px", marginTop: "4px", padding: "10px 14px", background: "#003D2B", border: "1px solid #00C89633", borderRadius: "8px" }}>
              ✓ Email verified successfully. You can now log in.
            </div>
          )}

          {isInvalidToken && (
            <div style={{ fontSize: "13px", color: colors.error, marginBottom: "12px", marginTop: "4px", padding: "10px 14px", background: "#1A0808", border: "1px solid #FF6B6B22", borderRadius: "8px" }}>
              Verification link is invalid or expired. Try registering again.
            </div>
          )}

          {error && (
            <div style={{ fontSize: "13px", color: colors.error, marginBottom: "12px", marginTop: "4px" }}>
              {error}
            </div>
          )}

          {/* ── submit button ── */}
          <div style={{ marginTop: error ? "0" : "16px" }}>
            <button
              id="login-submit"
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
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          {/* ── register link ── */}
          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: colors.textMuted,
              marginTop: "24px",
              marginBottom: "12px",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              style={{
                color: colors.accent,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Register
            </Link>
          </p>

          {/* ── forgot password ── */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: colors.textMuted,
              margin: 0,
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: colors.textMuted,
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>

      {/* ── global placeholder color override ── */}
      <style>{`
        #login-email::placeholder,
        #login-password::placeholder {
          color: ${colors.textMuted};
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default Login
