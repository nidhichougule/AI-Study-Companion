import { useState } from "react";
import styles from "./Dashboard.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import TopBar from "../../components/TopBar/TopBar";
import DashboardHome from "../../components/DashboardHome/DashboardHome";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className={styles.rightPane}>
        <TopBar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <DashboardHome />
      </div>
    </div>
  );
}

