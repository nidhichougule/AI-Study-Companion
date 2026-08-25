import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Please fill in all fields.");
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
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === "ERR_NETWORK" ? "Cannot connect to backend server. Please ensure port 5000 is running." : "Login failed ❌")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2>🧠 AI Study Companion</h2>
        <p>Login to continue</p>

        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ fontSize: 13, textAlign: "center", marginTop: 8 }}>
          Don't have an account? <Link to="/register" style={{ color: "#3b82f6" }}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  card: {
    padding: 30,
    background: "#111827",
    borderRadius: 10,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 5,
    border: "none",
  },
  button: {
    padding: 10,
    background: "#22c55e",
    border: "none",
    color: "white",
    cursor: "pointer",
  },
};