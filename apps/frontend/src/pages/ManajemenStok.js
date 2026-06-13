import React, { useState, useEffect } from "react";
import SidebarDokter from "../components/SidebarDokter";
import "../styles/ManajemenStok.css";
import axiosClient from "../service/axiosClient";

export default function ManajemenStok() {
  const [stocks, setStocks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // State Form Tambah Stok
  const [form, setForm] = useState({
    blood_type: "A",
    rhesus: "+",
    quantity: "",
    expired_date: "",
  });

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil Data Stok Darah
      const resStock = await axiosClient.get("/stok-darah");
      setStocks(resStock.data.data || []);

      // Ambil Data Riwayat Donasi (Pendonor)
      const resDonations = await axiosClient.get("/donations");
      setDonations(resDonations.data.data || []);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Tambah Stok
  const handleSave = async () => {
    if (!form.quantity || !form.expired_date) {
      alert("Harap isi jumlah dan tanggal kedaluwarsa!");
      return;
    }

    try {
      // Payload sesuaikan dengan model backend
      const payload = {
        blood_type: form.blood_type,
        rhesus: form.rhesus,
        quantity: parseInt(form.quantity),
        expired_date: form.expired_date,
        hospital: "RSUP H. Adam Malik" // Default atau ambil dari profil dokter login
      };

      await axiosClient.post("/stok-darah", payload);
      alert("Stok darah berhasil ditambahkan!");
      closeModal();
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Gagal menambah stok:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDeleteStok = async (id) => {
    if(!window.confirm("Hapus data stok ini?")) return;
    try {
        await axiosClient.delete(`/stok-darah/${id}`);
        fetchData();
    } catch (error) {
        alert("Gagal menghapus data.");
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setForm({ blood_type: "A", rhesus: "+", quantity: "", expired_date: "" });
  };

  // Helper: Status Stok (Dummy Logic based on quantity)
  const getStockStatus = (qty) => {
    if (qty > 100) return { label: "AMAN", class: "green" };
    if (qty > 50) return { label: "STANDAR", class: "yellow" };
    return { label: "KRITIKAL", class: "red" };
  };

  // Helper: Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  return (
    <div className="ms-container">
      <SidebarDokter />

      <main className="ms-content">
        <h2 className="ms-page-title">Manajemen Stok Darah</h2>

        {/* ===================== CARD STOK DARAH ===================== */}
        <div className="ms-card">
          <div className="ms-card-header">
            <h3>🩸 Stok Darah Terkini</h3>

            <div className="ms-btn-group">
              <button className="ms-btn-add" onClick={openModal}>
                ➕ Tambah Stok
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Gol. Darah</th>
                  <th>Jumlah (Unit)</th>
                  <th>Target Min.</th>
                  <th>Kedaluwarsa</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                ) : stocks.length > 0 ? (
                    stocks.map((item) => {
                        const status = getStockStatus(item.quantity);
                        return (
                            <tr key={item.id}>
                                <td><span className="ms-blood-badge">{item.blood_type}{item.rhesus}</span></td>
                                <td>{item.quantity}</td>
                                <td>200</td> {/* Target statis sementara */}
                                <td>{formatDate(item.expired_date)}</td>
                                <td><span className={`ms-badge ${status.class}`}>{status.label}</span></td>
                                <td className="ms-actions">
                                    <button className="ms-btn-icon delete" onClick={() => handleDeleteStok(item.id)}>🗑️</button>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr><td colSpan="6" className="text-center">Belum ada data stok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== DATA PENDONOR (RIWAYAT) ===================== */}
        <div className="ms-card mt-30">
          <div className="ms-card-header">
            <h3>📝 Riwayat Masuk (Donasi)</h3>
          </div>

          <div className="table-responsive">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Pendonor</th>
                  <th>Gol. Darah</th>
                  <th>Jumlah</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                ) : donations.length > 0 ? (
                    donations.map((d) => (
                        <tr key={d.id}>
                            <td>{formatDate(d.created_at)}</td>
                            <td>{d.user?.name || "Anonim"}</td>
                            <td>{d.user?.blood_type}{d.user?.rhesus}</td>
                            <td>1 Kantong</td>
                            <td>{d.location || "RSUP H. Adam Malik"}</td>
                            <td><span className="ms-badge green">BERHASIL</span></td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="6" className="text-center">Belum ada riwayat donasi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== MODAL ===================== */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Tambah Stok Darah</h3>

              <div className="modal-body">
                <div className="ms-form-group">
                    <label>Golongan Darah</label>
                    <div className="ms-row">
                        <select 
                            className="ms-input"
                            value={form.blood_type} 
                            onChange={(e) => setForm({...form, blood_type: e.target.value})}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <select 
                            className="ms-input"
                            value={form.rhesus} 
                            onChange={(e) => setForm({...form, rhesus: e.target.value})}
                            style={{width: '80px'}}
                        >
                            <option value="+">+</option>
                            <option value="-">-</option>
                        </select>
                    </div>
                </div>

                <div className="ms-form-group">
                    <label>Jumlah Stok (Kantong)</label>
                    <input
                        type="number"
                        className="ms-input"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        placeholder="Contoh: 10"
                    />
                </div>

                <div className="ms-form-group">
                    <label>Tanggal Kedaluwarsa</label>
                    <input
                        type="date"
                        className="ms-input"
                        value={form.expired_date}
                        onChange={(e) => setForm({ ...form, expired_date: e.target.value })}
                    />
                </div>
              </div>

              <div className="modal-actions">
                <button className="ms-btn-cancel" onClick={closeModal}>Batal</button>
                <button className="ms-btn-save" onClick={handleSave}>Simpan</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}