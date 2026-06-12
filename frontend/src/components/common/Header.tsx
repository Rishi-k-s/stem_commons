import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { theme } from "../../styles/theme";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useAuth } from "../../context/AuthContext";

const navBtnStyle = {
  fontFamily: theme.fonts.heading,
  fontSize: "0.78rem",
  color: "rgba(0,0,0,0.45)",
  background: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: theme.letterSpacing.wide,
  padding: 0,
  transition: "color 0.15s",
};

export function Header() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, isAdmin, isOwner, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const dashboardPath = isAdmin ? "/admin" : isOwner ? "/owner" : null;

  return (
    <header
      style={{
        flexShrink: 0,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: theme.colors.background,
        position: "relative" as const,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "0 18px" : "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: isMobile ? theme.fontSizes.md : theme.fontSizes.lg,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: theme.colors.text,
                lineHeight: 1,
              }}
            >
              STEM COMMONS
            </div>
            <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.55rem", letterSpacing: theme.letterSpacing.widest, color: theme.colors.primary, marginTop: "1px" }}>
              DISCOVERY PLATFORM
            </div>
          </div>
        </Link>

        {isMobile ? (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              background: "none",
              border: `1px solid ${theme.colors.border}`,
              cursor: "pointer",
              color: theme.colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        ) : (
          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <Link to="/resources" style={{ textDecoration: "none" }}>
              <button
                style={navBtnStyle as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
              >
                DIRECTORY
              </button>
            </Link>
            <Link to="/map" style={{ textDecoration: "none" }}>
              <button
                style={navBtnStyle as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
              >
                MAP
              </button>
            </Link>
            {["About", "Contact"].map((item) => (
              <button
                key={item}
                style={navBtnStyle as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
              >
                {item.toUpperCase()}
              </button>
            ))}

            {/* Auth control */}
            {!loading && (
              user ? (
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    style={{
                      ...(navBtnStyle as React.CSSProperties),
                      color: theme.colors.text,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      border: `1px solid ${theme.colors.border}`,
                      padding: "6px 12px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.colors.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.colors.border)}
                  >
                    {user.username.toUpperCase()}
                    <ChevronDown size={11} />
                  </button>
                  {userMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        background: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        minWidth: "160px",
                        zIndex: 30,
                      }}
                    >
                      {dashboardPath && (
                        <Link
                          to={dashboardPath}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "10px 16px",
                            fontFamily: theme.fonts.heading,
                            fontSize: "0.75rem",
                            letterSpacing: theme.letterSpacing.wide,
                            color: theme.colors.text,
                            textDecoration: "none",
                            borderBottom: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          DASHBOARD
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 16px",
                          fontFamily: theme.fonts.heading,
                          fontSize: "0.75rem",
                          letterSpacing: theme.letterSpacing.wide,
                          color: theme.colors.primary,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="md">
                    LOGIN
                  </Button>
                </Link>
              )
            )}
          </nav>
        )}
      </div>

      {/* Mobile dropdown menu + tap-to-close backdrop */}
      {isMobile && menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            aria-hidden
            style={{
              position: "fixed",
              top: "56px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 19,
            }}
          />
          <nav
            style={{
              position: "absolute",
              top: "56px",
              left: 0,
              right: 0,
              background: theme.colors.background,
              borderBottom: `1px solid ${theme.colors.border}`,
              boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              padding: "12px 18px 20px",
              zIndex: 21,
            }}
          >
            {[
              { label: "DIRECTORY", to: "/resources" },
              { label: "MAP", to: "/map" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: "none",
                  fontFamily: theme.fonts.heading,
                  fontSize: "0.95rem",
                  letterSpacing: theme.letterSpacing.wide,
                  color: theme.colors.text,
                  padding: "12px 4px",
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                {item.label}
              </Link>
            ))}
            {["About", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => setMenuOpen(false)}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: theme.fonts.heading,
                  fontSize: "0.95rem",
                  letterSpacing: theme.letterSpacing.wide,
                  color: theme.colors.text,
                  padding: "12px 4px",
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                {item.toUpperCase()}
              </button>
            ))}

            {/* Mobile auth row */}
            {!loading && (
              user ? (
                <>
                  <div
                    style={{
                      padding: "12px 4px",
                      borderBottom: `1px solid ${theme.colors.border}`,
                      fontFamily: theme.fonts.heading,
                      fontSize: "0.85rem",
                      letterSpacing: theme.letterSpacing.wide,
                      color: "rgba(0,0,0,0.45)",
                    }}
                  >
                    {user.username.toUpperCase()}
                    <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.65rem", marginLeft: "8px" }}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  {dashboardPath && (
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        textDecoration: "none",
                        fontFamily: theme.fonts.heading,
                        fontSize: "0.95rem",
                        letterSpacing: theme.letterSpacing.wide,
                        color: theme.colors.text,
                        padding: "12px 4px",
                        borderBottom: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      DASHBOARD
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: theme.fonts.heading,
                      fontSize: "0.95rem",
                      letterSpacing: theme.letterSpacing.wide,
                      color: theme.colors.primary,
                      padding: "12px 4px",
                      marginTop: "4px",
                    }}
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ textDecoration: "none", marginTop: "12px" }} onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="md" style={{ width: "100%", justifyContent: "center" }}>
                    LOGIN
                  </Button>
                </Link>
              )
            )}
          </nav>
        </>
      )}
    </header>
  );
}
