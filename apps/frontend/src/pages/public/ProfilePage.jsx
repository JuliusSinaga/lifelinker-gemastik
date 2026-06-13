import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ProfilePage.css"; // Pastikan path ini sesuai struktur folder Anda
import { FaSignOutAlt, FaCheckCircle, FaExclamationTriangle, FaCamera } from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profil");
  const navigate = useNavigate();
  
  // --- STATE MODAL & POPUP ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  // Fungsi Logout
  const handleLogoutClick = () => setShowLogoutModal(true);
  
  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-login"));
    navigate("/login-pengguna");
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

      <main className="profile-main">
        <div className="profile-container">
          
          {/* --- SIDEBAR (KIRI) --- */}
          <div className="profile-sidebar">
            {/* Kartu User */}
            <div className="profile-user-card">
              <div className="profile-user-avatar">
                {formData.photo_url ? (
                    <img 
                            src={formData.photo_url} 
                            alt={formData.name} 
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${formData.name}`}}
                        />
                    ) : (
                        <div className="avatar-initial-circle">{getInitials(formData.name)}</div>
                    )}
              </div>
              <label htmlFor="avatar-upload" className="avatar-edit-btn">
                    <FaCamera />
                </label>
                <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={handleAvatarChange}
                />
              <h3>{formData.name || "User"}</h3>
              <p>{formData.city || "Kota belum diisi"}</p>
            </div>

            {/* Kartu Donor Digital */}
            <div className="profile-donor-card">
              <div className="donor-card-header"><h4>KARTU DONOR DIGITAL</h4></div>
              <div className="donor-card-blood-type">
                {formData.blood_type}{formData.rhesus}
              </div>
              <div className="donor-card-info">
                <div className="donor-card-row"><span>Tanggal Lahir</span><span>Jenis Kelamin</span></div>
                <div className="donor-card-row">
                  <span>{formData.birth_date ? formatDate(formData.birth_date) : "-"}</span>
                  <span>{formData.gender || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- KONTEN UTAMA (KANAN) --- */}
          <div className="profile-content">
            {/* Navigasi Tab */}
            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === "profil" ? "active" : ""}`} onClick={() => setActiveTab("profil")}>Profil Saya</button>
              <button className={`profile-tab ${activeTab === "statistik" ? "active" : ""}`} onClick={() => setActiveTab("statistik")}>Statistik & Riwayat</button>
              <button className={`profile-tab ${activeTab === "pengaturan" ? "active" : ""}`} onClick={() => setActiveTab("pengaturan")}>Pengaturan Akun</button>
            </div>

            {/* TAB 1: FORM EDIT PROFIL */}
            {activeTab === "profil" && (
              <div className="profile-form-section">
                <h3>Informasi Pribadi & Medis</h3>
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Lengkap</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Lahir</label>
                      <input type="date" name="birth_date" value={formData.birth_date ? formData.birth_date.split('T')[0] : ""} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} disabled className="input-disabled"/>
                    </div>
                    <div className="form-group">
                      <label>Nomor Telepon</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kota Domisili</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Berat Badan (kg)</label>
                      <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                     <div className="form-group">
                        <label>Golongan Darah</label>
                        <select name="blood_type" value={formData.blood_type} onChange={handleChange}>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                     </div>
                     <div className="form-group">
                        <label>Rhesus</label>
                        <select name="rhesus" value={formData.rhesus} onChange={handleChange}>
                            <option value="+">Positif (+)</option>
                            <option value="-">Negatif (-)</option>
                        </select>
                     </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-save" onClick={handleSave}>Simpan Perubahan</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STATISTIK & RIWAYAT */}
            {activeTab === "statistik" && (
              <div className="profile-stats">
                <div className="stats-summary">
                  <div className="stat-box">
                    <div className="stat-number">{stats.totalDonations}</div>
                    <div className="stat-label">Total Donasi</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{stats.livesSaved}</div>
                    <div className="stat-label">Nyawa Terselamatkan</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number stat-large">{stats.nextDonor}</div>
                    <div className="stat-label">Menuju Donor Berikutnya</div>
                  </div>
                </div>

                <div className="history-table">
                  <h3>Riwayat Donor Terakhir</h3>
                  <table>
                    <thead><tr><th>Tanggal</th><th>Lokasi/Keterangan</th><th>Status</th></tr></thead>
                    <tbody>
                      {stats.history.length > 0 ? (
                        stats.history.map((item, idx) => (
                          <tr key={idx}>
                            <td>{formatDate(item.donation_date)}</td>
                            <td>{item.location || "RSUP H. Adam Malik (Default)"}</td>
                            <td>
                                <span className={`status-badge ${item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'}`}>
                                    {item.status}
                                </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="empty-table-msg">Belum ada riwayat donor.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PENGATURAN AKUN */}
            {activeTab === "pengaturan" && (
              <div className="profile-settings">
                <div className="settings-section">
                  
                  <div className="form-group-full">
                    <label>Email Akun</label>
                    <input type="email" value={formData.email} className="settings-input input-disabled" readOnly />
                  </div>
                  
                  <div className="settings-password-row">
                    <div className="form-group">
                        <label>Password Lama</label>
                        <input 
                            type="password" 
                            name="oldPassword"
                            placeholder="••••••••" 
                            className="settings-input" 
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password Baru</label>
                        <input 
                            type="password" 
                            name="newPassword"
                            placeholder="••••••••" 
                            className="settings-input" 
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Konfirmasi Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="••••••••" 
                            className="settings-input" 
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>
                  </div>
                  
                  <div className="settings-actions">
                    <button className="btn-save-settings" onClick={handleChangePassword}>Ganti Password</button>
                  </div>

                  <div className="settings-logout-section">
                      <h4 className="settings-logout-title">Zona Keluar</h4>
                      <p className="logout-desc">Keluar dari akun Anda di perangkat ini.</p>
                      <button className="btn-logout-settings" onClick={handleLogoutClick}>
                      <FaSignOutAlt /> Keluar dari Aplikasi
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- POPUP MODAL (SUKSES/GAGAL) --- */}
      {showSaveModal && (
        <div className="popup-modal-overlay">
          <div className="popup-modal">
            <div className={`popup-icon ${modalType}`}>
                {modalType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            </div>
            <h3>{modalType === 'success' ? 'Berhasil' : 'Gagal'}</h3>
            <p>{modalMessage}</p>
            <button className="btn-popup-ok" onClick={() => setShowSaveModal(false)}>OK</button>
          </div>
        </div>
      )}

      {/* --- MODAL LOGOUT --- */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-icon-wrapper"><FaSignOutAlt /></div>
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin keluar?</p>
            <div className="logout-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
              <button className="btn-modal-confirm" onClick={confirmLogout}>
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}