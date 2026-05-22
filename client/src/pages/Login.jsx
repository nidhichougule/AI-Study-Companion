import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await loginUser(formData);

    if (data.token) {
      localStorage.setItem("token", data.token);
      setMessage("Login successful");
      navigate("/dashboard");
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleLogin}>
        <h1>Login</h1>

        <input
          style={input}
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          style={input}
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button style={button}>Login</button>

        <p>{message}</p>

        <p>
          New user? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </div>
  );
}

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh",
};

const card = {
  background: "white",
  padding: "30px",
  width: "350px",
  borderRadius: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

export default Login;