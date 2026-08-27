import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (token && !authLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, authLoading, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.data?.token) {
        login(res.data.token, res.data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid credentials or server response.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === "ERR_NETWORK"
            ? "Cannot connect to backend server. Please ensure port 5000 is running."
            : "Login failed. Please check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGlow} />
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <BookIcon />
          </div>
          <h1 style={styles.brandTitle}>AI Study Companion</h1>
          <p style={styles.brandSub}>Your Intelligent RAG Study Tutor</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <MailIcon />
              </span>
              <input
                placeholder="name@college.edu"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Workspace"}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account?</span>
          <Link to="/register" style={styles.registerLink}>
            Create an Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0e1a",
    color: "#f8fafc",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    padding: "36px 32px",
    background: "rgba(17, 24, 39, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: "12px",
    boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
  },
  brandTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  brandSub: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "0 12px",
    transition: "all 0.2s ease",
  },
  inputIcon: {
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    marginRight: "10px",
  },
  input: {
    flex: 1,
    padding: "12px 0",
    background: "none",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: "14px",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  submitBtn: {
    marginTop: "8px",
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
    transition: "transform 0.15s ease, opacity 0.15s ease",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    marginTop: "4px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  },
  footerText: {
    color: "#94a3b8",
  },
  registerLink: {
    color: "#818cf8",
    fontWeight: "600",
  },
};