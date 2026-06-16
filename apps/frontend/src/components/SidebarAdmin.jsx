import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "../styles/SidebarAdmin.css";
import Icon from "./core/Icon";
import Button from "./core/Button";

export default function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
      localStorage.setItem("sidebarCollapsed", "true");
    } else {
      document.body.classList.remove("sidebar-collapsed");
      localStorage.setItem("sidebarCollapsed", "false");
    }
  }, [isCollapsed]);

  const active = (path) =>
    location.pathname === path ? "menu-item active" : "menu-item";

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside className="admin-sidebar" style={{ backgroundColor: 'var(--color-bg-admin-sidebar)' }}>

        {/* ===================== LOGO HEADER ===================== */}
        <div 
          className="admin-header-logo-box" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-logo-row">
            <img
              src="/images/lifelinker-logo.png"
              alt="LifeLinker Logo"
              className="admin-logo-inline"
            />

            <div className="admin-logo-text-group">
              <span className="admin-logo-title" style={{ fontFamily: 'var(--font-family-brand)' }}>
                <span style={{ color: 'var(--color-brand-primary)' }}>Life</span><span style={{ color: 'var(--color-surface-card)' }}>Linker</span>
              </span>
              <span className="admin-role" style={{ color: 'var(--color-status-warning)' }}>Admin</span>
            </div>
          </div>
        </div>

        {/* ===================== MENU ===================== */}
        <nav className="sidebar-menu">
          <Link to="/dashboard-admin" className={active("/dashboard-admin")}>
            <Icon icon="mdi:view-dashboard" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Dashboard</span>
          </Link>

          <Link to="/manajemen-dokter" className={active("/manajemen-dokter")}>
            <Icon icon="fontisto:doctor" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Manajemen Dokter</span>
          </Link>

          <Link to="/manajemen-user" className={active("/manajemen-user")}>
            <Icon icon="mdi:account-group" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Manajemen User</span>
          </Link>

          <Link
            to="/manajemen-event-admin"
            className={active("/manajemen-event-admin")}
          >
            <Icon icon="material-symbols:event" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Manajemen Event</span>
          </Link>

          <NavLink
            to="/admin/pengaturan"
            className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
          >
            <Icon icon="mdi:cog" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Pengaturan Konten Web</span>
          </NavLink>

          <Link
            to="/manajemen-pendonor"
            className={active("/manajemen-pendonor")}
          >
            <Icon icon="mdi:hand-heart" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Manajemen Pendonor</span>
          </Link>

          <Link to="/laporan" className={active("/laporan")}>
            <Icon icon="mdi:file-document-outline" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Laporan</span>
          </Link>

          <Link to="/profile-admin" className={active("/profile-admin")}>
            <Icon icon="mdi:account" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            <span className="menu-item-text">Profil Saya</span>
          </Link>
        </nav>

        {/* ===================== TOGGLE & LOGOUT ===================== */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '24px' }}>
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => setShowLogoutModal(true)}
            style={{ color: 'var(--color-status-error)', justifyContent: isCollapsed ? 'center' : 'flex-start', paddingLeft: isCollapsed ? '0' : '15px' }}
          >
            <Icon icon="mdi:logout" width="20" style={{ marginRight: isCollapsed ? '0' : '12px' }} />
            {!isCollapsed && <span className="menu-item-text">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* ===================== LOGOUT MODAL ===================== */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="logout-modal" style={{ backgroundColor: 'var(--color-surface-card)', padding: '24px', borderRadius: 'var(--radius-standard)', textAlign: 'center', width: '300px', boxShadow: 'var(--shadow-elevated)' }}>
            <h3 style={{ fontFamily: 'var(--font-family-primary)', marginTop: 0 }}>Konfirmasi Logout</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Apakah Anda yakin ingin logout?</p>

            <div className="logout-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Button
                variant="secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </Button>

              <Button variant="primary" style={{ backgroundColor: 'var(--color-status-error)' }} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
