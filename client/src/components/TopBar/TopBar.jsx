import styles from "./TopBar.module.css";
import { useAuth } from "../../hooks/useAuth";

const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function TopBar() {
  const { user } = useAuth();
  return (
    <header className={styles.topbar}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbHome}>Dashboard</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Notifications">
          <BellIcon />
          <span className={styles.notifDot}></span>
        </button>
        <div className={styles.avatar}>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
      </div>
    </header>
  );
}
