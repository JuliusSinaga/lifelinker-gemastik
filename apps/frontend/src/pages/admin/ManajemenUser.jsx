import React, { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin"; 
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";
import "../../styles/ManajemenUser.css"; 

export default function ManajemenUser() {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // STATE BARU: Untuk Modal Konfirmasi
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/users");
      const dataUser = response.data.data || [];
      const userDokter = dataUser.filter(u => u.role === 'user' || u.role === 'dokter');
      setUsers(userDokter);
    } catch (err) {
      console.error("Gagal ambil data user:", err);
      setError("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Fungsi saat tombol tong sampah diklik (Hanya buka modal)
  const handleDeleteClick = (user) => {
    setDeleteModal({ show: true, id: user.id, name: user.name });
  };

  // 2. Fungsi Eksekusi Hapus (Saat tombol "Hapus" di modal diklik)
  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await axiosClient.delete(`/users/${deleteModal.id}`);
      
      // Tutup modal
      setDeleteModal({ show: false, id: null, name: "" });
      
      // Refresh data
      fetchUsers(); 
      alert("User berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus user:", err);
      alert("Gagal menghapus user. Coba lagi nanti.");
    }
  };

  // 3. Fungsi Batal
  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, name: "" });
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const name = user.name || ""; 
    const email = user.email || "";
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
  });

  return (
    <div className="admin-layout">
      <SidebarAdmin />

      <main className="admin-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <div className="admin-header-content" style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)" }}>Manajemen User</h1>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Kelola data pendonor (User Biasa) aplikasi LifeLinker.</p>
        </div>

        <div className="search-bar-container" style={{ display: "flex", alignItems: "center", marginBottom: "24px", position: "relative", maxWidth: "400px" }}>
          <Icon icon="mdi:magnify" className="search-icon" style={{ position: "absolute", left: "16px", color: "var(--color-text-secondary)" }} />
          <Input
            type="text"
            placeholder="Cari nama atau email pendonor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", paddingLeft: "44px", borderRadius: "24px" }}
          />
        </div>

        {error && <div className="error-message" style={{ backgroundColor: "var(--color-status-error)15", color: "var(--color-status-error)", padding: "12px", borderRadius: "var(--radius-standard)", marginBottom: "24px" }}>{error}</div>}

        <Card variant="standard" className="table-card" style={{ padding: "24px", overflowX: "auto" }}>
          {loading ? (
            <p className="loading-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px" }}>Memuat data...</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Nama Lengkap</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Email</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>No HP</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Gol. Darah</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Kota</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id || index} style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                        <td style={{ padding: "16px" }}>
                          <div className="user-name-cell" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="user-avatar-small" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>{user.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{user.email}</td>
                        <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{user.phone || "-"}</td>
                        <td style={{ padding: "16px" }}>
                          {user.blood_type ? (
                            <span className="badge-blood" style={{ backgroundColor: "var(--color-status-error)15", color: "var(--color-status-error)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>
                              {user.blood_type} {user.rhesus}
                            </span>
                          ) : (
                            <span className="text-muted" style={{ color: "var(--color-text-tertiary)" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{user.city || "-"}</td>
                        <td style={{ padding: "16px" }}>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon delete" 
                              onClick={() => handleDeleteClick(user)}
                              title="Hapus User"
                              style={{ background: "none", border: "none", color: "var(--color-status-error)", cursor: "pointer", fontSize: "18px", opacity: 0.8, transition: "opacity 0.2s" }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                              onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
                            >
                              <Icon icon="mdi:delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                        Tidak ada data pengguna ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteModal.show && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="modal-box delete-modal" style={{ padding: "40px", textAlign: "center", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div className="modal-icon-warning" style={{ fontSize: "64px", color: "var(--color-status-error)" }}>
              <Icon icon="mdi:alert" />
            </div>
            <h3 style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "24px" }}>Hapus Akun?</h3>
            <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
              Apakah Anda yakin ingin menghapus <strong style={{ color: "var(--color-text-primary)" }}>{deleteModal.name}</strong>? 
              <br></br>Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px", width: "100%" }}>
              <Button variant="outline" className="btn-cancel" onClick={cancelDelete} style={{ flex: 1 }}>
                Batal
              </Button>
              <Button variant="primary" className="btn-confirm-delete" onClick={confirmDelete} style={{ flex: 1, backgroundColor: "var(--color-status-error)", borderColor: "var(--color-status-error)" }}>
                Ya, Hapus
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* ============================================================ */}

    </div>
  );
}