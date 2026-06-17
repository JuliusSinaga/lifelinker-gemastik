import React, { useState, useEffect, useRef } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import "../../styles/ProfileAdmin.css"; 

import Card from "../../components/core/Card";
import Button from "../../components/core/Button";
import Input from "../../components/core/Input";
import Icon from "../../components/core/Icon";

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
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumut", icon: "mdi:account-group", colorClass: "blue" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "mdi:doctor", colorClass: "yellow" },
    { value: "10,275", title: "Pendonor Aktif", subtitle: "Seluruh Provinsi", icon: "mdi:water", colorClass: "green" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "mdi:calendar", colorClass: "purple" },
  ];

  return (
    <div className="admin-layout">
      <SidebarAdmin />

      <main className="admin-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <div className="profil-header" style={{ marginBottom: "32px" }}>
          <h1 className="page-title" style={{ margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)" }}>Profil Administrator</h1>
        </div>

        {/* METRICS */}
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, idx) => {
            const colorMap = {
                blue: "var(--color-status-info)",
                yellow: "var(--color-status-warning)",
                green: "var(--color-status-success)",
                purple: "var(--color-brand-primary)"
            };
            const iconColor = colorMap[m.colorClass] || "var(--color-brand-primary)";

            return (
                <Card variant="standard" className="metric-card" key={idx} style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="metric-content" style={{ flex: 1 }}>
                    <div className="metric-value" style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", marginBottom: "4px" }}>{m.value}</div>
                    <div className="metric-title" style={{ fontSize: "14px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>{m.title}</div>
                    <div className="metric-subtitle" style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>{m.subtitle}</div>
                  </div>
                  <div className="metric-icon" style={{ fontSize: "40px", color: iconColor, opacity: 0.8, backgroundColor: `${iconColor}15`, width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                    <Icon icon={m.icon} width="32" height="32" />
                  </div>
                </Card>
            );
          })}
        </div>

        <div className="profil-content-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* KARTU EDIT PROFIL */}
            <Card variant="standard" className="profile-card main-profile-card" style={{ padding: "32px" }}>
            <h2 className="section-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Edit Informasi Profil</h2>

            <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px" }}>
                <div className="profile-left" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nama Lengkap</label>
                    <Input
                    type="text"
                    name="name"
                    value={adminData.name}
                    onChange={handleProfileChange}
                    style={{ width: "100%" }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Email</label>
                    <Input
                    type="email"
                    value={adminData.email}
                    readOnly
                    style={{ width: "100%", backgroundColor: "var(--color-surface-background)" }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nomor Telepon</label>
                    <Input
                    type="text"
                    name="phone"
                    value={adminData.phone}
                    onChange={handleProfileChange}
                    placeholder="+62..."
                    style={{ width: "100%" }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Departemen / Role</label>
                    <Input
                    type="text"
                    value={`${adminData.department} - ${adminData.role}`}
                    readOnly
                    style={{ width: "100%", backgroundColor: "var(--color-surface-background)" }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Status Akun</label>
                    <div><span className="status-badge-active" style={{ backgroundColor: "var(--color-status-success)15", color: "var(--color-status-success)", padding: "8px 16px", borderRadius: "16px", fontWeight: "bold", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}><Icon icon="mdi:checkbox-blank-circle" style={{ fontSize: "10px" }} /> Aktif</span></div>
                </div>

                <Button 
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={loadingProfile}
                    style={{ marginTop: "16px", alignSelf: "flex-start" }}
                >
                    {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                </div>

                <div className="profile-right" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-large)", alignSelf: "start", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid var(--color-border-divider)" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--color-text-secondary)" }}>Foto Profil</h3>
                <div className="avatar-preview-container" style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", backgroundColor: "var(--color-brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "4px solid white", boxShadow: "var(--shadow-sm)" }}>
                    {adminData.photo ? (
                        <img src={adminData.photo} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div className="avatar-placeholder" style={{ fontSize: "48px", fontWeight: "bold", color: "white" }}>
                            {adminData.name ? adminData.name.charAt(0).toUpperCase() : "A"}
                        </div>
                    )}
                </div>
                
                <p className="photo-name" style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "18px", color: "var(--color-text-primary)" }}>{adminData.name}</p>
                <p className="photo-role" style={{ margin: "0 0 24px 0", fontSize: "14px", color: "var(--color-text-secondary)" }}>{adminData.role}</p>

                <div className="photo-actions" style={{ display: "flex", gap: "12px" }}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{display: 'none'}} 
                        accept="image/*"
                    />
                    <Button variant="primary" onClick={triggerFileSelect} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icon icon="mdi:camera" /> Ganti Foto
                    </Button>
                    {adminData.photo && (
                        <Button variant="outline" onClick={handleRemovePhoto}>
                            Hapus
                        </Button>
                    )}
                </div>
                </div>
            </div>
            </Card>

            {/* KARTU GANTI PASSWORD */}
            <Card variant="standard" className="password-card" style={{ padding: "32px" }}>
            <h2 className="section-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Ubah Kata Sandi</h2>
            <div className="password-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", maxWidth: "500px" }}>
                <div className="form-group">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Saat Ini</label>
                <Input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    style={{ width: "100%" }}
                />
                </div>
                <div className="form-group">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Baru</label>
                <Input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    style={{ width: "100%" }}
                />
                </div>
                <div className="form-group">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Konfirmasi Password</label>
                <Input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    style={{ width: "100%" }}
                />
                </div>
            </div>
            <Button 
                variant="primary"
                onClick={handleSavePassword}
                disabled={loadingPassword}
                style={{ marginTop: "24px" }}
            >
                {loadingPassword ? "Memproses..." : "Update Password"}
            </Button>
            </Card>

        </div>
      </main>

      {/* --- POPUP MODAL --- */}
      {popup.show && (
        <div className="modal-overlay" onClick={closePopup} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="modal-content-popup" onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: "400px", padding: "50px 32px 32px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px", marginTop: "40px", overflow: "visible" }}>
            <div className={`popup-icon ${popup.type}`} style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", color: popup.type === "success" ? "var(--color-status-success)" : "var(--color-status-error)", backgroundColor: "white", borderRadius: "50%", padding: "4px", display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {popup.type === "success" ? <Icon icon="mdi:check-circle" width="80" height="80" /> : <Icon icon="mdi:close-circle" width="80" height="80" />}
            </div>
            <h3 className="popup-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "24px" }}>
                {popup.type === "success" ? "Berhasil!" : "Gagal!"}
            </h3>
            <p className="popup-message" style={{ margin: 0, color: "var(--color-text-secondary)" }}>{popup.message}</p>
            <Button variant="primary" onClick={closePopup} style={{ marginTop: "8px", minWidth: "120px" }}>OK</Button>
          </Card>
        </div>
      )}

    </div>
  );
}