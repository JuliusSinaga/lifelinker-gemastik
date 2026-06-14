import React, { useState, useEffect } from "react";
import DokterSidebar from "../components/SidebarDokter";
import "../styles/ProfilDokter.css";
import axiosClient from "../service/axiosClient";
import Icon from "../components/core/Icon";
import Button from "../components/core/Button";
import Card from "../components/core/Card";
import Input from "../components/core/Input";

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

      <main className="dokter-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <div className="profil-header" style={{ marginBottom: "32px" }}>
          <h1 className="page-title" style={{ fontFamily: "var(--font-family-brand)", margin: 0 }}>Profil Saya</h1>
        </div>

        <div className="pd-container" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", margin: "0 auto" }}>
            {/* KARTU IDENTITAS SINGKAT */}
            <Card variant="standard" className="pd-card profile-summary" style={{ display: "flex", alignItems: "center", gap: "24px", padding: "32px" }}>
                <div className="pd-avatar" style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px" }}>
                    <Icon icon="mdi:doctor" />
                </div>
                <div className="pd-info" style={{ flex: 1 }}>
                    <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontFamily: "var(--font-family-brand)" }}>{doctorData.name || "Nama Dokter"}</h2>
                    <p style={{ margin: "0 0 12px 0", color: "var(--color-text-secondary)" }}>{doctorData.specialization || "Spesialisasi Belum Diisi"}</p>
                    <span className="pd-badge" style={{ backgroundColor: "var(--color-brand-primary)15", color: "var(--color-brand-primary)", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>{doctorData.hospital || "Rumah Sakit"}</span>
                </div>
            </Card>

            {/* FORM DATA PROFESIONAL */}
            <Card variant="standard" className="pd-card" style={{ padding: "32px" }}>
            <h2 className="pd-section-title" style={{ margin: "0 0 24px 0", fontSize: "20px", fontFamily: "var(--font-family-brand)", borderBottom: "1px solid var(--color-border-divider)", paddingBottom: "16px" }}>Informasi Profesional & Pribadi</h2>

            <div className="pd-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
                <div className="pd-form-group full-width" style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nama Lengkap (dengan gelar)</label>
                    <Input 
                        type="text" 
                        name="name"
                        value={doctorData.name} 
                        onChange={handleProfileChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Email</label>
                    <Input 
                        type="email" 
                        value={doctorData.email} 
                        readOnly 
                        className="input-readonly"
                        title="Email tidak dapat diubah"
                        style={{ backgroundColor: "var(--color-surface-background)" }}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nomor Telepon</label>
                    <Input 
                        type="text" 
                        name="phone"
                        value={doctorData.phone} 
                        onChange={handleProfileChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nomor STR</label>
                    <Input 
                        type="text" 
                        name="str_number"
                        value={doctorData.str_number} 
                        onChange={handleProfileChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Spesialisasi</label>
                    <Input 
                        type="text" 
                        name="specialization"
                        value={doctorData.specialization} 
                        onChange={handleProfileChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Instansi / Rumah Sakit</label>
                    <Input 
                        type="text" 
                        name="hospital"
                        value={doctorData.hospital} 
                        onChange={handleProfileChange}
                    />
                </div>

                <div className="pd-form-group full-width" style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Kota Domisili</label>
                    <Input 
                        type="text" 
                        name="city"
                        value={doctorData.city} 
                        onChange={handleProfileChange}
                    />
                </div>
            </div>

            <Button 
                variant="primary"
                className="pd-btn-save" 
                onClick={handleSaveProfile}
                disabled={loadingProfile}
                style={{ width: "100%", padding: "14px" }}
            >
                {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            </Card>

            {/* FORM GANTI PASSWORD */}
            <Card variant="standard" className="pd-card" style={{ padding: "32px" }}>
            <h2 className="pd-section-title" style={{ margin: "0 0 24px 0", fontSize: "20px", fontFamily: "var(--font-family-brand)", borderBottom: "1px solid var(--color-border-divider)", paddingBottom: "16px" }}>Ubah Kata Sandi</h2>

            <div className="pd-grid" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
                <div className="pd-form-group full-width">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Saat Ini</label>
                    <Input 
                        type="password" 
                        name="current"
                        value={passwords.current} 
                        onChange={handlePasswordChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Baru</label>
                    <Input 
                        type="password" 
                        name="new"
                        value={passwords.new} 
                        onChange={handlePasswordChange}
                    />
                </div>

                <div className="pd-form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Konfirmasi Password</label>
                    <Input 
                        type="password" 
                        name="confirm"
                        value={passwords.confirm} 
                        onChange={handlePasswordChange}
                    />
                </div>
            </div>

            <Button 
                variant="outline"
                className="pd-btn-password" 
                onClick={handleSavePassword}
                disabled={loadingPassword}
                style={{ width: "100%", padding: "14px" }}
            >
                {loadingPassword ? "Memproses..." : "Ubah Kata Sandi"}
            </Button>
            </Card>
        </div>
      </main>

      {/* POPUP MODAL */}
      {popup.show && (
        <div className="modal-overlay" onClick={closePopup} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="modal-content-popup" onClick={(e) => e.stopPropagation()} style={{ padding: "40px", textAlign: "center", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div className={`popup-icon ${popup.type}`} style={{ fontSize: "64px", color: popup.type === "success" ? "var(--color-status-success)" : "var(--color-status-error)" }}>
                {popup.type === "success" ? <Icon icon="mdi:check-circle" /> : <Icon icon="mdi:close-circle" />}
            </div>
            <h3 className="popup-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "24px" }}>
                {popup.type === "success" ? "Berhasil!" : "Gagal!"}
            </h3>
            <p className="popup-message" style={{ margin: 0, color: "var(--color-text-secondary)" }}>{popup.message}</p>
            <Button variant="primary" className="popup-btn" onClick={closePopup} style={{ width: "100%", marginTop: "16px" }}>OK</Button>
          </Card>
        </div>
      )}

    </div>
  );
}