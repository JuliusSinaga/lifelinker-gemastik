import React, { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import "../../styles/ManajemenStok.css";
import axiosClient from "../../service/axiosClient";

export default function ManajemenStok() {
  const [stocks, setStocks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk Smart Matching
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingForm, setMatchingForm] = useState({ blood_type: "A", rhesus: "+" });
  const [notificationSent, setNotificationSent] = useState(false);

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

  // 4. Handle Smart Matching
  const handleSmartMatching = async () => {
    setIsMatching(true);
    setNotificationSent(false);
    try {
      const res = await axiosClient.get(`/stok-darah/matching?blood_type=${matchingForm.blood_type}&rhesus=${matchingForm.rhesus}`);
      setMatchingResults(res.data.data || []);
    } catch (error) {
      console.error("Gagal matching:", error);
      alert("Gagal melakukan pencocokan.");
    } finally {
      setIsMatching(false);
    }
  };

  // 5. Handle Send FCM Notification
  const handleSendNotification = async () => {
    try {
      // Asumsikan lokasi dokter ini id=1 (dummy untuk demo)
      await axiosClient.post("/notifications/send", {
        lokasi_id: 1,
        blood_type: matchingForm.blood_type,
        rhesus: matchingForm.rhesus,
        message: `Dibutuhkan segera donor darah ${matchingForm.blood_type}${matchingForm.rhesus} di RS Anda. Klik untuk detail!`
      });
      setNotificationSent(true);
      alert("Notifikasi darurat berhasil dikirim ke kandidat pendonor!");
    } catch (error) {
      console.error("Gagal kirim notif:", error);
      alert("Gagal mengirim notifikasi FCM.");
    }
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

            <div className="search-bar">
              <input type="text" placeholder="Cari golongan darah atau No. Kantong..." className="search-input" />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-emergency" onClick={() => setShowMatchingModal(true)} style={{ backgroundColor: "var(--color-status-error)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="icon">🚨</span> Cari Donor Darurat
              </button>
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

        {/* MODAL SMART MATCHING */}
        {showMatchingModal && (
          <div className="ms-modal-overlay">
            <div className="ms-modal" style={{ maxWidth: "600px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="modal-title" style={{ margin: 0 }}>🚨 Smart Matching Donor Darurat</h3>
                  <button onClick={() => { setShowMatchingModal(false); setMatchingResults([]); setNotificationSent(false); }} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
              </div>
              
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>Sistem akan mencari pendonor terdekat dengan riwayat kesehatan yang valid (Masa tunggu 90 hari).</p>
              
              <div className="form-group-row" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Golongan Darah Darurat</label>
                  <select className="ms-input" value={matchingForm.blood_type} onChange={e => setMatchingForm({...matchingForm, blood_type: e.target.value})}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Rhesus</label>
                  <select className="ms-input" value={matchingForm.rhesus} onChange={e => setMatchingForm({...matchingForm, rhesus: e.target.value})}>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>

              <button onClick={handleSmartMatching} disabled={isMatching} style={{ width: "100%", marginBottom: "24px", padding: "12px", backgroundColor: "var(--color-brand-primary)", color: "white", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                {isMatching ? "Mencari Kandidat..." : "Cari Kandidat Berdasarkan Radius & AI"}
              </button>

              {matchingResults.length > 0 && (
                <div className="matching-results" style={{ backgroundColor: "var(--color-surface-alt)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                  <h4 style={{ margin: "0 0 12px 0", color: "var(--color-status-success)" }}>Ditemukan {matchingResults.length} Kandidat Terdekat!</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", maxHeight: "150px", overflowY: "auto" }}>
                    {matchingResults.map((m, i) => (
                      <li key={i} style={{ padding: "12px 8px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{m.user.name}</strong> <br/>
                          <small style={{ color: "var(--color-text-tertiary)" }}>Jarak: {m.jarak.toFixed(1)} km</small>
                        </div>
                        <span style={{ color: "var(--color-brand-primary)", fontWeight: "bold", fontSize: "1.2rem" }}>{m.skor.toFixed(0)} pts</span>
                      </li>
                    ))}
                  </ul>

                  {!notificationSent ? (
                    <button onClick={handleSendNotification} style={{ backgroundColor: "var(--color-status-error)", color: "white", width: "100%", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", gap: "8px" }}>
                      <span>🔔</span> Kirim Push Notification (FCM)
                    </button>
                  ) : (
                    <div style={{ padding: "12px", backgroundColor: "var(--color-status-success)20", color: "var(--color-status-success)", textAlign: "center", borderRadius: "8px", fontWeight: "bold" }}>
                      ✅ Notifikasi Berhasil Dikirim ke {matchingResults.length} Kandidat!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}