import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SidebarAdmin.css";

export default function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const active = (path) =>
    location.pathname === path ? "menu-item active" : "menu-item";

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside className="admin-sidebar">

        {/* ===================== LOGO HEADER ===================== */}
        <div className="admin-header-logo-box">
          <div className="admin-logo-row">
            <img
              src="/images/lifelinker-logo.png"
              alt="LifeLinker Logo"
              className="admin-logo-inline"
            />

            <div className="admin-logo-text-group">
              <span className="admin-logo-title">
                <span className="red">Life</span>Linker
              </span>
              <span className="admin-role">Admin</span>
            </div>
          </div>
        </div>

        {/* ===================== MENU ===================== */}
        <nav className="sidebar-menu">
          <Link to="/dashboard-admin" className={active("/dashboard-admin")}>
            Dashboard
          </Link>

          <Link to="/manajemen-dokter" className={active("/manajemen-dokter")}>
            Manajemen Dokter
          </Link>

          <Link to="/manajemen-user" className={active("/manajemen-user")}>
            Manajemen User
          </Link>

          {/* 🔥 ROUTE DIBENARKAN SESUAI PERMINTAAN */}
          <Link
            to="/manajemen-event-admin"
            className={active("/manajemen-event-admin")}
          >
            Manajemen Event
          </Link>

          <Link
            to="/manajemen-pendonor"
            className={active("/manajemen-pendonor")}
          >
            Manajemen Pendonor
          </Link>

          <Link to="/laporan" className={active("/laporan")}>
            Laporan
          </Link>

          <Link to="/profile-admin" className={active("/profile-admin")}>
            Profil Saya
          </Link>
        </nav>

        {/* ===================== LOGOUT BUTTON ===================== */}
        <button className="logout" onClick={() => setShowLogoutModal(true)}>
          Logout
        </button>
      </aside>

      {/* ===================== LOGOUT MODAL ===================== */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin logout?</p>

            <div className="logout-actions">
              <button
                className="cancel-logout"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>

              <button className="confirm-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
