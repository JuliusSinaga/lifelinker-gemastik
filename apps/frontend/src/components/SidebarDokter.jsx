import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SidebarDokter.css";
import Icon from "./core/Icon";
import Button from "./core/Button";
import Avatar from "./core/Avatar";

export default function SidebarDokter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. State untuk menyimpan data dokter yang login
  const [doctorData, setDoctorData] = useState({
    name: "Dr. Pengguna",
    specialization: "Dokter Umum",
    photo_url: null
  });

  // 2. Ambil data dari LocalStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setDoctorData({
          name: user.nama || user.name || "Dr. Tanpa Nama",
          specialization: user.spesialisasi || user.specialization || "Dokter Umum",
          photo_url: user.photo_url || null
        });
      } catch (error) {
        console.error("Gagal memuat data dokter:", error);
      }
    }
  }, []);

  const active = (path) =>
    location.pathname === path ? "menu-item active" : "menu-item";

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear(); // Hapus semua sesi
    window.dispatchEvent(new Event("user-login")); // Update status global
    navigate("/"); // Kembali ke halaman utama
  };

  return (
    <>
      <aside className="dokter-sidebar" style={{ backgroundColor: 'var(--color-bg-page)', borderRight: '1px solid var(--color-border-divider)' }}>

        {/* --- PROFIL DINAMIS --- */}
        <div className="doctor-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
          <Avatar 
            src={doctorData.photo_url} 
            name={doctorData.name} 
            size={80} 
            style={{ marginBottom: '16px', border: '3px solid white', boxShadow: 'var(--shadow-base)' }}
          />
          <h4 style={{ fontFamily: 'var(--font-family-primary)', margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>{doctorData.name}</h4>
          <p style={{ fontFamily: 'var(--font-family-primary)', margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>{doctorData.specialization}</p>
        </div>

        {/* --- MENU NAVIGASI --- */}
        <nav className="sidebar-menu">
          <Link to="/dashboard-dokter" className={active("/dashboard-dokter")}>
            <Icon icon="mdi:view-dashboard" width="20" style={{ marginRight: '12px' }} />
            Dashboard
          </Link>
          <Link to="/manajemen-stok" className={active("/manajemen-stok")}>
            <Icon icon="mdi:water" width="20" style={{ marginRight: '12px' }} />
            Manajemen Stok
          </Link>
          <Link to="/manajemen-event" className={active("/manajemen-event")}>
            <Icon icon="material-symbols:event" width="20" style={{ marginRight: '12px' }} />
            Manajemen Event
          </Link>
          <Link to="/konsultasi-edukasi" className={active("/konsultasi-edukasi")}>
            <Icon icon="mdi:chat" width="20" style={{ marginRight: '12px' }} />
            Konsultasi & Edukasi
          </Link>
          <Link to="/profile-dokter" className={active("/profile-dokter")}>
            <Icon icon="mdi:account" width="20" style={{ marginRight: '12px' }} />
            Profil Saya
          </Link>
        </nav>

        {/* --- TOMBOL LOGOUT --- */}
        <div style={{ padding: '0 24px', marginTop: 'auto', marginBottom: '24px' }}>
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => setShowLogoutModal(true)}
            style={{ color: 'var(--color-status-error)', justifyContent: 'flex-start', paddingLeft: '16px' }}
          >
            <Icon icon="mdi:logout" width="20" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ---------------- MODAL KONFIRMASI LOGOUT ---------------- */}
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