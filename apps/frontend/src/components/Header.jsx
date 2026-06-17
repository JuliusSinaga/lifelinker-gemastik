import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./core/Icon";
import Button from "./core/Button";
import Avatar from "./core/Avatar";
import "../styles/Header.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("user-login", checkLoginStatus);
    return () => window.removeEventListener("user-login", checkLoginStatus);
  }, []);

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/" || path === "/beranda") {
      return location.pathname === "/" || location.pathname === "/beranda";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/" className="app-logo">
            <img
              src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
              alt="LifeLinker"
              className="app-logo-image"
            />
            <span className="app-logo-text" style={{ fontFamily: 'var(--font-family-brand)', color: 'var(--color-brand-primary)' }}>LifeLinker</span>
          </Link>

          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <Icon icon="mdi:close" width="24" /> : <Icon icon="mdi:menu" width="24" />}
          </div>

          <div className={`nav-menu-wrapper ${isMobileMenuOpen ? "active" : ""}`}>
            <ul className="app-nav-links">
              <li><Link to="/" className={`app-nav-link ${isActive("/") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link></li>
              <li><Link to="/lokasi-donor" className={`app-nav-link ${isActive("/lokasi-donor") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Lokasi Donor</Link></li>
              <li><Link to="/stok-darah" className={`app-nav-link ${isActive("/stok-darah") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Stok Darah</Link></li>
              <li><Link to="/event" className={`app-nav-link ${isActive("/event") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Event</Link></li>
              
              {(user?.role === 'user' || !user) && (
                <>
                  <li><Link to="/riwayat" className={`app-nav-link ${isActive("/riwayat") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Riwayat</Link></li>
                  <li><Link to="/konsultasi" className={`app-nav-link ${isActive("/konsultasi") ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>Konsultasi</Link></li>
                </>
              )}
            </ul>

            <div className="app-nav-actions">
              {isLoggedIn && user ? (
                <div 
                    className="app-user-info" 
                    onClick={() => setShowDropdown(!showDropdown)} 
                    style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                  <div className="user-name-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="user-name" style={{ fontFamily: 'var(--font-family-primary)', fontWeight: 'var(--font-weight-medium)' }}>Halo, {user.nama || user.name}</span>
                      <Icon icon="mdi:chevron-down" width="16" style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  
                  <Avatar src={user.photo_url} name={user.nama || user.name} size={40} />

                  {showDropdown && (
                    <div className="user-dropdown">
                        <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                            <Icon icon="mdi:account" width="16" style={{ marginRight: '8px' }}/> Profil Saya
                        </Link>
                        
                        {user.role === 'admin' && (
                            <Link to="/dashboard-admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                <Icon icon="mdi:view-dashboard" width="16" style={{ marginRight: '8px' }}/> Dashboard Admin
                            </Link>
                        )}
                        
                        {user.role === 'dokter' && (
                            <Link to="/dashboard-dokter" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                <Icon icon="mdi:view-dashboard" width="16" style={{ marginRight: '8px' }}/> Dashboard Dokter
                            </Link>
                        )}
                        
                        <div onClick={handleLogoutClick} className="dropdown-item logout" style={{ color: 'var(--color-status-error)' }}>
                            <Icon icon="mdi:logout" width="16" style={{ marginRight: '8px' }}/> Keluar
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons" style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/pilih-role" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="small">Login</Button>
                  </Link>
                  <Link to="/pilih-role" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="pill" size="small">Daftar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {showLogoutModal && (
        <div className="header-modal-overlay">
          <div className="header-modal" style={{ position: 'relative', backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--radius-standard)', padding: '50px 24px 24px 24px', textAlign: 'center', boxShadow: 'var(--shadow-elevated)', marginTop: '40px', overflow: 'visible', width: '100%', maxWidth: '400px' }}>
            <div className="modal-icon-warning" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', color: 'var(--color-status-warning)', backgroundColor: 'white', borderRadius: '50%', padding: '4px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Icon icon="mdi:alert-circle-outline" width="80" height="80" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-family-primary)', margin: '0 0 8px 0' }}>Konfirmasi Logout</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Apakah Anda yakin ingin keluar dari akun ini?</p>

            <div className="header-modal-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={confirmLogout} style={{ backgroundColor: 'var(--color-status-error)' }}>
                Ya, Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}