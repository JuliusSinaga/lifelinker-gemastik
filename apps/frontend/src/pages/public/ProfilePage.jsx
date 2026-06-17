import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ProfilePage.css"; 
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profil");
  const navigate = useNavigate();
  
  // --- STATE MODAL & POPUP ---

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // 'success' atau 'error'
  const [modalMessage, setModalMessage] = useState("");

  // --- STATE DATA USER ---
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    blood_type: "O",
    rhesus: "+",
    weight: "",
    birth_date: "",
    gender: "",
    role: "user",
    photo_url: "" 
  });

  // --- STATE PASSWORD ---
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // --- STATE STATISTIK DONOR ---
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesSaved: 0,
    nextDonor: "-",
    history: []
  });

  // 1. Load Data User saat Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login-pengguna");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setFormData(prev => ({ ...prev, ...user }));
      
      // Ambil riwayat jika ID user tersedia
      if (user.id) fetchDonationHistory(user.id);
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }, [navigate]);

  // 2. Fetch Riwayat & Statistik Donor
  const fetchDonationHistory = async (userId) => {
    try {
      const response = await axiosClient.get(`/donations?user_id=${userId}`);
      const data = response.data.data || [];
      
      // Filter & Sort
      const approvedDonations = data.filter(d => d.status === "Approved");
      const sortedHistory = data.sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));

      // Hitung Jadwal Donor Berikutnya (3 Bulan setelah donor terakhir)
      let nextDateStr = "-";
      if (approvedDonations.length > 0) {
        const lastDonationDate = new Date(approvedDonations[0].donation_date);
        const nextDate = new Date(lastDonationDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        const today = new Date();
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        nextDateStr = diffDays > 0 ? `${diffDays} Hari Lagi` : "Bisa Sekarang!";
      } else {
        nextDateStr = "Siap Donor";
      }

      setStats({
        totalDonations: approvedDonations.length,
        livesSaved: approvedDonations.length * 3, // Asumsi 1 kantong menyelamatkan 3 nyawa
        nextDonor: nextDateStr,
        history: sortedHistory
      });
    } catch (error) {
      console.error("Gagal mengambil riwayat donasi:", error);
    }
  };

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi Update Profil
  const handleSave = async () => {
    try {
      await axiosClient.put(`/users/${formData.id}`, formData);
      
      // Simpan ke LocalStorage agar perubahan persist di sesi ini
      localStorage.setItem("user", JSON.stringify(formData));
      
      // Trigger event agar Header update nama/foto otomatis
      window.dispatchEvent(new Event("user-login"));
      
      setModalType("success");
      setModalMessage("Profil berhasil diperbarui!");
      setShowSaveModal(true);
      
      // Tutup modal otomatis setelah 2 detik
      setTimeout(() => setShowSaveModal(false), 2000);
    } catch (error) {
      setModalType("error");
      setModalMessage("Gagal memperbarui profil.");
      setShowSaveModal(true);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file (Opsional)
    if (!file.type.startsWith('image/')) {
        alert("Mohon unggah file gambar.");
        return;
    }

    // Siapkan FormData untuk upload file
    const uploadData = new FormData();
    uploadData.append("avatar", file);

    try {
        // Panggil API Upload
        const response = await axiosClient.post(`/users/${formData.id}/avatar`, uploadData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const newPhotoUrl = response.data.photo_url;

        // 1. Update State Lokal
        const updatedFormData = { ...formData, photo_url: newPhotoUrl };
        setFormData(updatedFormData);

        // 2. Update LocalStorage
        localStorage.setItem("user", JSON.stringify(updatedFormData));

        // 3. Trigger Event agar Header berubah
        window.dispatchEvent(new Event("user-login"));

        setModalType("success");
        setModalMessage("Foto profil berhasil diperbarui!");
        setShowSaveModal(true);
        setTimeout(() => setShowSaveModal(false), 2000);

    } catch (error) {
        console.error("Gagal upload avatar:", error);
        setModalType("error");
        setModalMessage("Gagal mengunggah foto.");
        setShowSaveModal(true);
    }
  };
  // Fungsi Ganti Password
  const handleChangePassword = async () => {
    // Validasi
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setModalType("error");
      setModalMessage("Mohon lengkapi semua kolom password.");
      setShowSaveModal(true);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setModalType("error");
      setModalMessage("Konfirmasi password tidak cocok.");
      setShowSaveModal(true);
      return;
    }
    if (passwordData.newPassword.length < 6) {
        setModalType("error");
        setModalMessage("Password minimal 6 karakter.");
        setShowSaveModal(true);
        return;
    }

    try {
      // Panggil API
      await axiosClient.put(`/users/${formData.id}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      setModalType("success");
      setModalMessage("Password berhasil diubah!");
      setShowSaveModal(true);
      
      // Reset form password
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" }); 
      setTimeout(() => setShowSaveModal(false), 2000);

    } catch (error) {
      console.error("Gagal ganti password:", error);
      const errorMsg = error.response?.data?.error || "Gagal mengubah password.";
      setModalType("error");
      setModalMessage(errorMsg);
      setShowSaveModal(true);
    }
  };

  // Helper Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  // Helper Inisial Nama (Fallback Foto)
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="profile-root">
      <Header />

      <main className="profile-main" style={{ backgroundColor: "var(--color-bg-page)", minHeight: "calc(100vh - 80px)", padding: "40px 20px" }}>
        <div className="profile-container" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "32px", alignItems: "flex-start" }}>
          
          {/* --- SIDEBAR (KIRI) --- */}
          <div className="profile-sidebar" style={{ width: "320px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Kartu User */}
            <Card variant="standard" className="profile-user-card" style={{ padding: "32px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="profile-user-avatar" style={{ position: "relative", marginBottom: "20px" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "4px solid white", boxShadow: "var(--shadow-sm)", backgroundColor: "var(--color-brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px", fontWeight: "bold" }}>
                    {formData.photo_url ? (
                        <img 
                                src={formData.photo_url} 
                                alt={formData.name} 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${formData.name}`}}
                            />
                        ) : (
                            <div className="avatar-initial-circle">{getInitials(formData.name)}</div>
                        )}
                </div>
                <label htmlFor="avatar-upload" className="avatar-edit-btn" style={{ position: "absolute", bottom: "4px", right: "4px", width: "36px", height: "36px", backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)", color: "var(--color-text-secondary)", transition: "all 0.2s" }}>
                    <Icon icon="mdi:camera" style={{ fontSize: "18px" }} />
                </label>
                <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={handleAvatarChange}
                />
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>{formData.name || "User"}</h3>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "14px" }}>{formData.city || "Kota belum diisi"}</p>
            </Card>

            {/* Kartu Donor Digital */}
            <Card variant="primary" className="profile-donor-card" style={{ padding: "24px", color: "white", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.1, fontSize: "150px" }}>
                <Icon icon="mdi:water" />
              </div>
              <div className="donor-card-header" style={{ marginBottom: "20px", position: "relative", zIndex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "1px", opacity: 0.9 }}>KARTU DONOR DIGITAL</h4>
              </div>
              <div className="donor-card-blood-type" style={{ fontSize: "48px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
                {formData.blood_type}<span style={{ fontSize: "32px" }}>{formData.rhesus}</span>
              </div>
              <div className="donor-card-info" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
                <div className="donor-card-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.8 }}>
                    <span>Tanggal Lahir</span><span>Jenis Kelamin</span>
                </div>
                <div className="donor-card-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "500" }}>
                  <span>{formData.birth_date ? formatDate(formData.birth_date) : "-"}</span>
                  <span>{formData.gender || "-"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* --- KONTEN UTAMA (KANAN) --- */}
          <div className="profile-content" style={{ flex: 1, minWidth: 0 }}>
            {/* Navigasi Tab */}
            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === "profil" ? "active" : ""}`} onClick={() => setActiveTab("profil")}>Profil Saya</button>
              <button className={`profile-tab ${activeTab === "statistik" ? "active" : ""}`} onClick={() => setActiveTab("statistik")}>Statistik & Riwayat</button>
              <button className={`profile-tab ${activeTab === "pengaturan" ? "active" : ""}`} onClick={() => setActiveTab("pengaturan")}>Pengaturan Akun</button>
            </div>

            {/* TAB 1: FORM EDIT PROFIL */}
            {activeTab === "profil" && (
              <Card variant="standard" className="profile-form-section" style={{ padding: "32px" }}>
                <h3 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)", fontSize: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-divider)" }}>Informasi Pribadi & Medis</h3>
                <div className="profile-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="form-row" style={{ display: "flex", gap: "20px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nama Lengkap</label>
                      <Input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Tanggal Lahir</label>
                      <Input type="date" name="birth_date" value={formData.birth_date ? formData.birth_date.split('T')[0] : ""} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="form-row" style={{ display: "flex", gap: "20px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Email</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Nomor Telepon</label>
                      <Input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: "flex", gap: "20px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Kota Domisili</label>
                      <Input type="text" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Berat Badan (kg)</label>
                      <Input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: "flex", gap: "20px" }}>
                     <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Golongan Darah</label>
                        <select name="blood_type" value={formData.blood_type} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", fontSize: "16px", outline: "none", transition: "border-color 0.2s" }}>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                     </div>
                     <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Rhesus</label>
                        <select name="rhesus" value={formData.rhesus} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", fontSize: "16px", outline: "none", transition: "border-color 0.2s" }}>
                            <option value="+">Positif (+)</option>
                            <option value="-">Negatif (-)</option>
                        </select>
                     </div>
                  </div>

                  <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <Button variant="primary" onClick={handleSave} style={{ minWidth: "200px" }}>Simpan Perubahan</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* TAB 2: STATISTIK & RIWAYAT */}
            {activeTab === "statistik" && (
              <div className="profile-stats" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="stats-summary" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <Card variant="standard" className="stat-box" style={{ padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div className="stat-number" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-brand-primary)", fontFamily: "var(--font-family-brand)", marginBottom: "8px" }}>{stats.totalDonations}</div>
                    <div className="stat-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", fontWeight: "500" }}>Total Donasi</div>
                  </Card>
                  <Card variant="standard" className="stat-box" style={{ padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div className="stat-number" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-brand-primary)", fontFamily: "var(--font-family-brand)", marginBottom: "8px" }}>{stats.livesSaved}</div>
                    <div className="stat-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", fontWeight: "500" }}>Nyawa Terselamatkan</div>
                  </Card>
                  <Card variant="standard" className="stat-box" style={{ padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div className="stat-number stat-large" style={{ fontSize: "28px", fontWeight: "bold", color: "var(--color-brand-primary)", fontFamily: "var(--font-family-brand)", marginBottom: "8px" }}>{stats.nextDonor}</div>
                    <div className="stat-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", fontWeight: "500" }}>Menuju Donor Berikutnya</div>
                  </Card>
                </div>

                <Card variant="standard" className="history-table" style={{ padding: "32px", overflow: "hidden" }}>
                  <h3 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>Riwayat Donor Terakhir</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead><tr style={{ borderBottom: "2px solid var(--color-border-divider)" }}><th style={{ padding: "16px", color: "var(--color-text-secondary)", fontWeight: "bold" }}>Tanggal</th><th style={{ padding: "16px", color: "var(--color-text-secondary)", fontWeight: "bold" }}>Lokasi/Keterangan</th><th style={{ padding: "16px", color: "var(--color-text-secondary)", fontWeight: "bold" }}>Status</th></tr></thead>
                      <tbody>
                        {stats.history.length > 0 ? (
                          stats.history.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                              <td style={{ padding: "16px" }}>{formatDate(item.donation_date)}</td>
                              <td style={{ padding: "16px" }}>{item.location || "RSUP H. Adam Malik (Default)"}</td>
                              <td style={{ padding: "16px" }}>
                                  <span className={`status-badge ${item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'}`} style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    backgroundColor: item.status === 'Approved' ? 'var(--color-status-success)20' : item.status === 'Rejected' ? 'var(--color-status-error)20' : 'var(--color-status-warning)20',
                                    color: item.status === 'Approved' ? 'var(--color-status-success)' : item.status === 'Rejected' ? 'var(--color-status-error)' : 'var(--color-status-warning)'
                                  }}>
                                      {item.status}
                                  </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="empty-table-msg" style={{ padding: "32px", textAlign: "center", color: "var(--color-text-secondary)" }}>Belum ada riwayat donor.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 3: PENGATURAN AKUN */}
            {activeTab === "pengaturan" && (
              <Card variant="standard" className="profile-settings" style={{ padding: "32px" }}>
                <div className="settings-section" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  
                  <div className="form-group-full">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Email Akun</label>
                    <Input type="email" value={formData.email} disabled />
                  </div>
                  
                  <div className="settings-password-row" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 style={{ margin: "0 0 -8px 0", fontFamily: "var(--font-family-brand)", fontSize: "18px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-divider)" }}>Ubah Password</h4>
                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Lama</label>
                        <Input 
                            type="password" 
                            name="oldPassword"
                            placeholder="••••••••" 
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Password Baru</label>
                        <Input 
                            type="password" 
                            name="newPassword"
                            placeholder="••••••••" 
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Konfirmasi Password</label>
                        <Input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="••••••••" 
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                  </div>
                  
                  <div className="settings-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="outline" onClick={handleChangePassword}>Ganti Password</Button>
                  </div>

                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* --- POPUP MODAL (SUKSES/GAGAL) --- */}
      {showSaveModal && (
        <div className="popup-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="popup-modal" style={{ position: "relative", padding: "50px 32px 32px 32px", textAlign: "center", maxWidth: "400px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "40px", overflow: "visible" }}>
            <div className={`popup-icon ${modalType}`} style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", color: modalType === 'success' ? 'var(--color-status-success)' : 'var(--color-status-error)', backgroundColor: "white", borderRadius: "50%", padding: "4px", display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <Icon icon={modalType === 'success' ? 'mdi:check-circle' : 'mdi:alert'} width="80" height="80" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "24px" }}>{modalType === 'success' ? 'Berhasil' : 'Gagal'}</h3>
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{modalMessage}</p>
            <Button variant="primary" onClick={() => setShowSaveModal(false)} style={{ marginTop: "16px", minWidth: "120px" }}>OK</Button>
          </Card>
        </div>
      )}

    </div>
  );
}