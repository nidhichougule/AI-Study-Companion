import { Link } from "react-router-dom";

function Signup() {
  return (
    <div style={container}>
      <div style={card}>
        <h1>Create Account</h1>

        <input style={input} type="text" placeholder="Full Name" />
        <input style={input} type="email" placeholder="Email" />
        <input style={input} type="password" placeholder="Password" />

        <button style={button}>Sign Up</button>

        <p>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
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
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

export default Signup;