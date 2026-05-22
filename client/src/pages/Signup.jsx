import { useState } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../services/api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const data = await signupUser(formData);
    setMessage(data.message);
  };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSignup}>
        <h1>Create Account</h1>

        <input style={input} name="name" type="text" placeholder="Full Name" onChange={handleChange} />
        <input style={input} name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input style={input} name="password" type="password" placeholder="Password" onChange={handleChange} />

        <button style={button}>Sign Up</button>

        <p>{message}</p>

        <p>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

const container = { display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" };
const card = { background: "white", padding: "30px", width: "350px", borderRadius: "12px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const input = { width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc" };
const button = { width: "100%", padding: "12px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px" };

export default Signup;