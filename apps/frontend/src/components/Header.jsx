import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaExclamationTriangle, 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaChevronDown 
} from "react-icons/fa"; 
import "../styles/Header.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fungsi untuk cek status login & ambil data user terbaru
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
    checkLoginStatus(); // Cek saat pertama kali load
    
    // Dengarkan event 'user-login' (yang di-trigger saat login atau update profil)
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

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <header className="app-header">
        <nav className="app-nav">
          {/* LOGO */}
          <Link to="/" className="app-logo">
            <img
              src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
              alt="LifeLinker"
              className="app-logo-image"
            />
            <span className="app-logo-text">LifeLinker</span>
          </Link>

          {/* MOBILE MENU TOGGLE */}
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* NAVIGATION LINKS */}
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

            {/* ACTION BUTTONS (Login/User) */}
            <div className="app-nav-actions">
              {isLoggedIn && user ? (
                <div 
                    className="app-user-info" 
                    onClick={() => setShowDropdown(!showDropdown)} 
                    style={{cursor: 'pointer'}}
                >
                  <div className="user-name-wrapper">
                      <span className="user-name">Halo, {user.nama || user.name}</span>
                      <FaChevronDown style={{ fontSize: '10px', color: '#6b7280', marginLeft: '5px' }} />
                  </div>
                  
                  {/* --- AVATAR DINAMIS --- */}
                  <div className="app-user-avatar">
                    {user.photo_url ? (
                        <img 
                            src={user.photo_url} 
                            alt="User" 
                            style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}
                            onError={(e) => {
                                e.target.style.display = 'none'; // Sembunyikan gambar rusak
                                e.target.parentElement.innerText = getInitials(user.nama || user.name); // Tampilkan inisial
                            }}
                        />
                    ) : (
                        getInitials(user.nama || user.name)
                    )}
                  </div>
                  {/* ---------------------- */}

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="user-dropdown">
                        <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                            <FaUser style={{fontSize: '14px'}}/> Profil Saya
                        </Link>
                        
                        {user.role === 'admin' && (
                            <Link to="/dashboard-admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                <FaTachometerAlt style={{fontSize: '14px'}}/> Dashboard Admin
                            </Link>
                        )}
                        
                        {user.role === 'dokter' && (
                            <Link to="/dashboard-dokter" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                <FaTachometerAlt style={{fontSize: '14px'}}/> Dashboard Dokter
                            </Link>
                        )}
                        
                        <div onClick={handleLogoutClick} className="dropdown-item logout">
                            <FaSignOutAlt style={{fontSize: '14px'}}/> Keluar
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/pilih-role" className="app-btn-login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/pilih-role" className="app-btn-register" onClick={() => setIsMobileMenuOpen(false)}>Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ===================== LOGOUT MODAL ===================== */}
      {showLogoutModal && (
        <div className="header-modal-overlay">
          <div className="header-modal">
            <div className="modal-icon-warning">
              <FaExclamationTriangle />
            </div>
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin keluar dari akun ini?</p>

            <div className="header-modal-actions">
              <button className="btn-header-cancel" onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
              <button className="btn-header-confirm" onClick={confirmLogout}>
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}