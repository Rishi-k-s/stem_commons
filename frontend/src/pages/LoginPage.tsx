import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { theme, gridBg } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/auth";
import { useIsMobile } from "../hooks/useMediaQuery";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, login } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const from = (location.state as LocationState | null)?.from ?? "/admin";

  // Already signed in → bounce to the intended destination.
  React.useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: theme.colors.background,
        position: "relative",
      }}
    >
      <div style={gridBg} />
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0, position: "relative", zIndex: 10 }} />
      <Header />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "32px 18px" : "48px 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.borderStrong}`,
            boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
          }}
        >
          {/* Header strip */}
          <div
            style={{
              background: theme.colors.primary,
              color: theme.colors.textInverse,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Lock size={18} />
            <span
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: theme.letterSpacing.wide,
              }}
            >
              ADMIN SIGN IN
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: isMobile ? "24px 20px" : "32px 28px" }}>
            <p
              style={{
                fontFamily: theme.fonts.body,
                fontSize: "0.88rem",
                color: theme.colors.textMuted,
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Restricted area. Sign in with your administrator account to manage resources.
            </p>

            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(185,28,28,0.08)",
                  border: "1px solid rgba(185,28,28,0.3)",
                  color: "#b91c1c",
                  padding: "10px 12px",
                  marginBottom: "18px",
                  fontFamily: theme.fonts.body,
                  fontSize: "0.82rem",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Email */}
            <label style={labelStyle}>EMAIL</label>
            <div style={fieldStyle}>
              <Mail size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <label style={{ ...labelStyle, marginTop: "16px" }}>PASSWORD</label>
            <div style={fieldStyle}>
              <Lock size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textMuted, display: "flex", flexShrink: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center", marginTop: "26px" }}
            >
              {submitting ? "SIGNING IN…" : "SIGN IN"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: theme.fonts.mono,
  fontSize: "0.62rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textMuted,
  marginBottom: "6px",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: `1px solid ${theme.colors.borderStrong}`,
  background: theme.colors.background,
  padding: "10px 12px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontFamily: theme.fonts.body,
  fontSize: "0.92rem",
  color: theme.colors.text,
  minWidth: 0,
};
