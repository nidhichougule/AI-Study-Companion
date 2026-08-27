import styles from "./TopBar.module.css";
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function TopBar({ onToggleMobileSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/chat":
        return "AI Chat & Study Companion";
      case "/upload":
        return "Document Management";
      case "/quiz":
        return "Practice Quiz Generator";
      default:
        return "StudyAI Platform";
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        {onToggleMobileSidebar && (
          <button className={styles.menuBtn} onClick={onToggleMobileSidebar} title="Open navigation menu">
            <MenuIcon />
          </button>
        )}
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbRoot}>App</span>
          <span className={styles.separator}>/</span>
          <span className={styles.breadcrumbCurrent}>{getPageTitle()}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Notifications">
          <BellIcon />
          <span className={styles.notifDot}></span>
        </button>
        <div className={styles.avatar} onClick={() => navigate("/dashboard")} title={user?.name || "Profile"}>
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </header>
  );
}

