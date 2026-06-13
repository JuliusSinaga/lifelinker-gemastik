import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/SidebarDokter.css";

export default function SidebarDokter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. State untuk menyimpan data dokter yang login
  const [doctorData, setDoctorData] = useState({
    name: "Dr. Pengguna",
    specialization: "Dokter Umum"
  });

  // 2. Ambil data dari LocalStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setDoctorData({
          name: user.nama || user.name || "Dr. Tanpa Nama",
          // Pastikan field ini sesuai dengan response backend (spesialisasi/specialization)
          specialization: user.spesialisasi || user.specialization || "Dokter Umum"
        });
      } catch (error) {
        console.error("Gagal memuat data dokter:", error);
      }
    }
  }, []);

  const active = (path) =>
    location.pathname === path ? "menu-item active" : "menu-item";

  // Helper: Ambil inisial nama untuk avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "D";
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.clear(); // Hapus semua sesi
    window.dispatchEvent(new Event("user-login")); // Update status global
    navigate("/"); // Kembali ke halaman utama
  };

  return (
    <>
      <aside className="dokter-sidebar">

        {/* --- PROFIL DINAMIS --- */}
        <div className="doctor-profile">
          {/* Menggunakan Avatar Inisial agar dinamis (seperti Header) */}
          {/* Anda bisa mengganti ini dengan <img> jika backend menyediakan URL foto */}
          <div 
            className="sidebar-photo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe', // Biru muda
              color: '#1e40af', // Biru tua
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 15px auto',
              border: '3px solid white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {getInitials(doctorData.name)}
          </div>
          
          <h4>{doctorData.name}</h4>
          <p>{doctorData.specialization}</p>
        </div>

        {/* --- MENU NAVIGASI --- */}
        <nav className="sidebar-menu">
          <Link to="/dashboard-dokter" className={active("/dashboard-dokter")}>
            Dashboard
          </Link>
          <Link to="/manajemen-stok" className={active("/manajemen-stok")}>
            Manajemen Stok
          </Link>
          <Link to="/manajemen-event" className={active("/manajemen-event")}>
            Manajemen Event
          </Link>
          <Link to="/konsultasi-edukasi" className={active("/konsultasi-edukasi")}>
            Konsultasi & Edukasi
          </Link>
          <Link to="/profile-dokter" className={active("/profile-dokter")}>
            Profil Saya
          </Link>
        </nav>

        {/* --- TOMBOL LOGOUT --- */}
        <button className="logout" onClick={() => setShowLogoutModal(true)}>
          Logout
        </button>
      </aside>

      {/* ---------------- MODAL KONFIRMASI LOGOUT ---------------- */}
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