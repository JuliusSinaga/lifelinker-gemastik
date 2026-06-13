import React, { useState, useEffect, useRef } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import "../styles/ProfileAdmin.css"; 
import axiosClient from "../service/axiosClient";
import { FaCheckCircle, FaTimesCircle, FaCamera } from "react-icons/fa"; // Import Icon

export default function ProfilAdmin() {
  // State Data Admin
  const [adminData, setAdminData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    department: "IT & Sistem",
    photo: null,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // State UI
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // State Popup (Pengganti Alert)
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });
  
  const fileInputRef = useRef(null);

  // Load Data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAdminData((prev) => ({
        ...prev,
        id: user.id,
        name: user.name || user.nama,
        email: user.email,
        phone: user.phone || user.no_hp || "",
        role: user.role || "Admin",
        photo: user.photo_url || null,
      }));
    }
  }, []);

  // --- HANDLERS ---

  const handleProfileChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAdminData({ ...adminData, photo: previewUrl });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleRemovePhoto = () => {
    setAdminData({ ...adminData, photo: null });
  };

  // Helper untuk menutup popup
  const closePopup = () => {
    setPopup({ ...popup, show: false });
  };

  // --- SAVE LOGIC ---

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      // Update LocalStorage
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { 
        ...currentUser, 
        name: adminData.name, 
        phone: adminData.phone,
        photo_url: adminData.photo 
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-login"));

      // Tampilkan Popup Sukses
      setPopup({
        show: true,
        type: "success",
        message: "Informasi profil berhasil diperbarui!",
      });

    } catch (error) {
      console.error("Gagal update profil:", error);
      // Tampilkan Popup Error
      setPopup({
        show: true,
        type: "error",
        message: "Gagal menyimpan perubahan. Silakan coba lagi.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
        setPopup({ show: true, type: "error", message: "Mohon lengkapi semua kolom password." });
        return;
    }
    if (passwords.new !== passwords.confirm) {
        setPopup({ show: true, type: "error", message: "Konfirmasi password baru tidak cocok!" });
        return;
    }
    if (passwords.new.length < 6) {
        setPopup({ show: true, type: "error", message: "Password baru minimal 6 karakter." });
        return;
    }

    setLoadingPassword(true);
    try {
      // Simulasi API Delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPopup({
        show: true,
        type: "success",
        message: "Password Anda berhasil diperbarui.",
      });
      
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        message: "Gagal mengubah password. Password saat ini salah.",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  // Metrics
  const metrics = [
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumut", icon: "👥" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "👨‍⚕️" },
    { value: "10,275", title: "Pendonor Aktif", subtitle: "Seluruh Provinsi", icon: "🩸" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "📅" },
  ];

  return (
    <div className="admin-layout">
      <SidebarAdmin />

      <main className="admin-main">
        <div className="profil-header">
          <h1 className="page-title">Profil Administrator</h1>
        </div>

        {/* METRICS */}
        <div className="metrics-grid">
          {metrics.map((m, idx) => (
            <div className="metric-card" key={idx}>
              <div className="metric-content">
                <div className="metric-value">{m.value}</div>
                <div className="metric-title">{m.title}</div>
                <div className="metric-subtitle">{m.subtitle}</div>
              </div>
              <div className="metric-icon">{m.icon}</div>
            </div>
          ))}
        </div>

        <div className="profil-content-wrapper">
            
            {/* KARTU EDIT PROFIL */}
            <div className="profile-card main-profile-card">
            <h2 className="section-title">Edit Informasi Profil</h2>

            <div className="profile-grid">
                <div className="profile-left">
                <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                    type="text"
                    name="name"
                    value={adminData.name}
                    onChange={handleProfileChange}
                    className="pa-input"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                    type="email"
                    value={adminData.email}
                    readOnly
                    className="pa-input input-readonly"
                    />
                </div>

                <div className="form-group">
                    <label>Nomor Telepon</label>
                    <input
                    type="text"
                    name="phone"
                    value={adminData.phone}
                    onChange={handleProfileChange}
                    placeholder="+62..."
                    className="pa-input"
                    />
                </div>

                <div className="form-group">
                    <label>Departemen / Role</label>
                    <input
                    type="text"
                    value={`${adminData.department} - ${adminData.role}`}
                    readOnly
                    className="pa-input input-readonly"
                    />
                </div>

                <div className="form-group">
                    <label>Status Akun</label>
                    <div><span className="status-badge-active">🟢 Aktif</span></div>
                </div>

                <button 
                    className="pa-btn-save" 
                    onClick={handleSaveProfile}
                    disabled={loadingProfile}
                >
                    {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                </div>

                <div className="profile-right">
                <h3>Foto Profil</h3>
                <div className="avatar-preview-container">
                    {adminData.photo ? (
                        <img src={adminData.photo} alt="Preview" className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder">
                            {adminData.name ? adminData.name.charAt(0).toUpperCase() : "A"}
                        </div>
                    )}
                </div>
                
                <p className="photo-name">{adminData.name}</p>
                <p className="photo-role">{adminData.role}</p>

                <div className="photo-actions">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{display: 'none'}} 
                        accept="image/*"
                    />
                    <button className="pa-btn-upload" onClick={triggerFileSelect}>
                        <FaCamera style={{marginRight:'5px'}}/> Ganti Foto
                    </button>
                    <button className="pa-btn-delete" onClick={handleRemovePhoto}>
                        Hapus
                    </button>
                </div>
                </div>
            </div>
            </div>

            {/* KARTU GANTI PASSWORD */}
            <div className="profile-card password-card">
            <h2 className="section-title">Ubah Kata Sandi</h2>
            <div className="password-grid">
                <div className="form-group">
                <label>Password Saat Ini</label>
                <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    className="pa-input"
                />
                </div>
                <div className="form-group">
                <label>Password Baru</label>
                <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    className="pa-input"
                />
                </div>
                <div className="form-group">
                <label>Konfirmasi Password</label>
                <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    className="pa-input"
                />
                </div>
            </div>
            <button 
                className="pa-btn-save-password" 
                onClick={handleSavePassword}
                disabled={loadingPassword}
            >
                {loadingPassword ? "Memproses..." : "Update Password"}
            </button>
            </div>

        </div>
      </main>

      {/* --- POPUP MODAL --- */}
      {popup.show && (
        <div className="modal-overlay" onClick={closePopup}>
          <div className="modal-content-popup" onClick={(e) => e.stopPropagation()}>
            <div className={`popup-icon ${popup.type}`}>
                {popup.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <h3 className="popup-title">
                {popup.type === "success" ? "Berhasil!" : "Gagal!"}
            </h3>
            <p className="popup-message">{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>
                OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}