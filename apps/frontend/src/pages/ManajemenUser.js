import React, { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin"; 
import axiosClient from "../service/axiosClient";
import { FaSearch, FaTrash, FaExclamationTriangle } from "react-icons/fa"; // Tambah Icon Segitiga
import "../styles/ManajemenUser.css"; 

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

      <main className="admin-content">
        <div className="admin-header-content">
          <h1>Manajemen User</h1>
          <p>Kelola data pendonor (User Biasa) aplikasi LifeLinker.</p>
        </div>

        <div className="search-bar-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau email pendonor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-card">
          {loading ? (
            <p className="loading-text">Memuat data...</p>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nama Lengkap</th>
                    <th>Email</th>
                    <th>No HP</th>
                    <th>Gol. Darah</th>
                    <th>Kota</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id || index}>
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar-small">
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || "-"}</td>
                        <td>
                          {user.blood_type ? (
                            <span className="badge-blood">
                              {user.blood_type} {user.rhesus}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{user.city || "-"}</td>
                        <td>
                          <div className="action-buttons">
                            {/* Panggil handleDeleteClick bukan langsung hapus */}
                            <button 
                              className="btn-icon delete" 
                              onClick={() => handleDeleteClick(user)}
                              title="Hapus User"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        Tidak ada data pengguna ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-box delete-modal">
            <div className="modal-icon-warning">
              <FaExclamationTriangle />
            </div>
            <h3>Hapus Akun?</h3>
            <p>
              Apakah Anda yakin ingin menghapus <strong>{deleteModal.name}</strong>? 
              <br></br>Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Batal
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ============================================================ */}

    </div>
  );
}