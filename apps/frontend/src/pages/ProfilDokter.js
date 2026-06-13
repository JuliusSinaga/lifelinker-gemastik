import React, { useState, useEffect } from "react";
import DokterSidebar from "../components/SidebarDokter";
import "../styles/ProfilDokter.css";
import axiosClient from "../service/axiosClient";
import { FaCheckCircle, FaTimesCircle, FaUserMd } from "react-icons/fa";

export default function ProfilDokter() {
  // State Data Dokter
  const [doctorData, setDoctorData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    str_number: "",
    specialization: "",
    hospital: "",
  });

  // State Password
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // State UI
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  // 1. Load Data dari LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setDoctorData({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        str_number: user.str_number || "",
        specialization: user.specialization || "",
        hospital: user.hospital || "",
      });
    }
  }, []);

  // --- HANDLERS ---
  const handleProfileChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const closePopup = () => setPopup({ ...popup, show: false });

  // 2. Simpan Profil
  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      // Panggil API Update (Opsional: sesuaikan endpoint jika ada)
      // await axiosClient.put(`/users/${doctorData.id}`, doctorData);

      // Update LocalStorage agar data persisten di frontend
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...currentUser, ...doctorData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Trigger event update di header/sidebar
      window.dispatchEvent(new Event("user-login"));

      setPopup({
        show: true,
        type: "success",
        message: "Data profil berhasil diperbarui!",
      });
    } catch (error) {
      console.error("Error update profile:", error);
      setPopup({
        show: true,
        type: "error",
        message: "Gagal menyimpan perubahan. Coba lagi.",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // 3. Ubah Password
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
      // Simulasi Request API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPopup({
        show: true,
        type: "success",
        message: "Kata sandi berhasil diubah.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      setPopup({
        show: true,
        type: "error",
        message: "Kata sandi saat ini salah.",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main">
        <div className="profil-header">
          <h1 className="page-title">Profil Saya</h1>
        </div>

        <div className="pd-container">
            {/* KARTU IDENTITAS SINGKAT */}
            <div className="pd-card profile-summary">
                <div className="pd-avatar">
                    <FaUserMd />
                </div>
                <div className="pd-info">
                    <h2>{doctorData.name || "Nama Dokter"}</h2>
                    <p>{doctorData.specialization || "Spesialisasi Belum Diisi"}</p>
                    <span className="pd-badge">{doctorData.hospital || "Rumah Sakit"}</span>
                </div>
            </div>

            {/* FORM DATA PROFESIONAL */}
            <div className="pd-card">
            <h2 className="pd-section-title">Informasi Profesional & Pribadi</h2>

            <div className="pd-grid">
                <div className="pd-form-group full-width">
                    <label>Nama Lengkap (dengan gelar)</label>
                    <input 
                        type="text" 
                        name="name"
                        value={doctorData.name} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={doctorData.email} 
                        readOnly 
                        className="pd-input input-readonly"
                        title="Email tidak dapat diubah"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Nomor Telepon</label>
                    <input 
                        type="text" 
                        name="phone"
                        value={doctorData.phone} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Nomor STR</label>
                    <input 
                        type="text" 
                        name="str_number"
                        value={doctorData.str_number} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Spesialisasi</label>
                    <input 
                        type="text" 
                        name="specialization"
                        value={doctorData.specialization} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Instansi / Rumah Sakit</label>
                    <input 
                        type="text" 
                        name="hospital"
                        value={doctorData.hospital} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group full-width">
                    <label>Kota Domisili</label>
                    <input 
                        type="text" 
                        name="city"
                        value={doctorData.city} 
                        onChange={handleProfileChange}
                        className="pd-input"
                    />
                </div>
            </div>

            <button 
                className="pd-btn-save" 
                onClick={handleSaveProfile}
                disabled={loadingProfile}
            >
                {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            </div>

            {/* FORM GANTI PASSWORD */}
            <div className="pd-card">
            <h2 className="pd-section-title">Ubah Kata Sandi</h2>

            <div className="pd-grid">
                <div className="pd-form-group full-width">
                    <label>Password Saat Ini</label>
                    <input 
                        type="password" 
                        name="current"
                        value={passwords.current} 
                        onChange={handlePasswordChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Password Baru</label>
                    <input 
                        type="password" 
                        name="new"
                        value={passwords.new} 
                        onChange={handlePasswordChange}
                        className="pd-input"
                    />
                </div>

                <div className="pd-form-group">
                    <label>Konfirmasi Password</label>
                    <input 
                        type="password" 
                        name="confirm"
                        value={passwords.confirm} 
                        onChange={handlePasswordChange}
                        className="pd-input"
                    />
                </div>
            </div>

            <button 
                className="pd-btn-password" 
                onClick={handleSavePassword}
                disabled={loadingPassword}
            >
                {loadingPassword ? "Memproses..." : "Ubah Kata Sandi"}
            </button>
            </div>
        </div>
      </main>

      {/* POPUP MODAL */}
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
            <button className="popup-btn" onClick={closePopup}>OK</button>
          </div>
        </div>
      )}

    </div>
  );
}