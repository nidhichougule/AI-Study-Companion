import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>AI Study Companion</h2>

      <div style={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e40af",
    color: "white",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "15px",
  },
};

export default Navbar;