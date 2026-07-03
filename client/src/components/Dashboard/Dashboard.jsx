import styles from "./Dashboard.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import TopBar from "../../components/TopBar/TopBar";
import DashboardHome from "../../components/DashboardHome/DashboardHome";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={styles.layout}>
      <Sidebar onLogout={handleLogout} />
      <div className={styles.rightPane}>
        <TopBar />
        <DashboardHome />
      </div>
    </div>
  );
}
