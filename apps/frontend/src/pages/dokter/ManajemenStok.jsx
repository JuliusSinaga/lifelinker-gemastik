import React, { useState, useEffect } from "react";
import SidebarDokter from "../../components/SidebarDokter";
import "../../styles/ManajemenStok.css";
import axiosClient from "../../service/axiosClient";

import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";

export default function ManajemenStok() {
  const [stocks, setStocks] = useState([]);
  const [searchTerm] = useState("");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk Smart Matching
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingForm, setMatchingForm] = useState({ blood_type: "A", rhesus: "+" });
  const [selectedDonation, setSelectedDonation] = useState(null);

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
    try {
      // Asumsikan lokasi dokter ini id=1
      const encodedRhesus = encodeURIComponent(matchingForm.rhesus);
      const res = await axiosClient.get(`/stok-darah/matching?blood_type=${matchingForm.blood_type}&rhesus=${encodedRhesus}&lokasi_id=1`);
      setMatchingResults(res.data.matches || []);
    } catch (error) {
      console.error("Gagal matching:", error);
      alert("Gagal melakukan pencocokan.");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="dokter-layout">
      <SidebarDokter />

      <main className="dokter-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <h2 className="ms-page-title" style={{ marginBottom: "5px" }}>Manajemen Stok Darah</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "30px", fontSize: "15px" }}>Perbarui dan pantau ketersediaan darah di instansi Anda.</p>

        {/* ===================== CARD STOK DARAH ===================== */}
        <div className="ms-card">
          <div className="ms-card-header">
            <h3>🩸 Stok Darah Terkini</h3>

            <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Button onClick={() => setShowMatchingModal(true)} style={{ backgroundColor: "#F13B3B", color: "white", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", height: "46px", boxSizing: "border-box" }}>
                  <Icon icon="mdi:alert-decagram" style={{ fontSize: "20px" }} /> Cari Donor Darurat
              </Button>
              
              <Button onClick={openModal} style={{ borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", height: "46px", boxSizing: "border-box" }}>
                  <Icon icon="mdi:plus" style={{ fontSize: "20px" }} /> Tambah Stok
              </Button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Gol.Darah</th>
                  <th>Jumlah(Unit)</th>
                  <th>Target Minimun</th>
                  <th>Tanggal Kadaluarsa Terdekat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                ) : stocks.length > 0 ? (
                    stocks
                    .filter(item => {
                      if (!searchTerm) return true;
                      const bloodStr = `${item.gol_darah}${item.rhesus}`.toLowerCase();
                      return bloodStr.includes(searchTerm.toLowerCase());
                    })
                    .map((item) => {
                        const status = getStockStatus(item.jumlah_kantong);
                        return (
                            <tr key={item.id}>
                                <td><strong style={{ fontSize: "16px" }}>{item.gol_darah}{item.rhesus}</strong></td>
                                <td>{item.jumlah_kantong}</td>
                                <td>200</td> {/* Target statis sementara */}
                                <td>{formatDate(item.waktu_pembaruan)}</td>
                                <td><span className={`ms-badge ${status.class}`}>{status.label}</span></td>
                                <td className="ms-actions">
                                    <Button onClick={() => handleDeleteStok(item.id)} style={{ padding: "6px 16px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "20px", backgroundColor: "#f3f4f6", color: "#1f2937", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: "600" }}>
                                        <Icon icon="mdi:delete" style={{ fontSize: "16px", color: "#6b7280" }} /> Hapus
                                    </Button>
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
            <h3>👥 Data Pendonor Stok Darah</h3>
          </div>

          <div className="table-responsive">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Tanggal Donor</th>
                  <th>Nama Pendonor</th>
                  <th>Gol.Darah</th>
                  <th>Jumlah(Kantong)</th>
                  <th>Rumah Sakit</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                ) : donations.length > 0 ? (
                    donations.map((d) => (
                        <tr key={d.id}>
                            <td>{formatDate(d.donation_date)}</td>
                            <td>{d.user?.name || "Anonim"}</td>
                            <td><strong style={{ fontSize: "16px" }}>{d.user?.blood_type || d.blood_type || "-"}{d.user?.rhesus || ""}</strong></td>
                            <td>{d.quantity || "1"} Kantong</td>
                            <td>{d.location || "RSUP H. Adam Malik"}</td>
                            <td><span className="ms-badge green" style={{ borderRadius: "20px", border: "1px solid #10b981", color: "#10b981", backgroundColor: "transparent" }}>Tersedia</span></td>
                            <td className="ms-actions">
                                <Button onClick={() => setSelectedDonation(d)} style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "20px", backgroundColor: "transparent", color: "#6b7280", border: "1px solid #d1d5db", cursor: "pointer", fontWeight: "600" }}>
                                    <Icon icon="mdi:eye" style={{ fontSize: "16px" }} /> Detail
                                </Button>
                            </td>
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
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: "600px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="modal-title" style={{ margin: 0 }}>🚨 Smart Matching Donor Darurat</h3>
                  <button onClick={() => { setShowMatchingModal(false); setMatchingResults([]); }} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
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
                          <small style={{ color: "var(--color-text-tertiary)" }}>Jarak: {m.distance_km.toFixed(1)} km</small>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <span style={{ color: "var(--color-brand-primary)", fontWeight: "bold", fontSize: "1.2rem" }}>{m.score.toFixed(0)} pts</span>
                            <a 
                                href={`https://wa.me/${m.user.phone?.replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(m.user.name)},%20kami%20dari%20Instansi%20Kesehatan%20sedang%20sangat%20membutuhkan%20donor%20darah%20golongan%20*${matchingForm.blood_type}${matchingForm.rhesus}*%20saat%20ini.%20Apakah%20Anda%20bersedia%20membantu?`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ backgroundColor: "#25D366", color: "white", padding: "6px 12px", borderRadius: "20px", textDecoration: "none", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(37, 211, 102, 0.3)" }}
                            >
                                <Icon icon="mdi:whatsapp" style={{ fontSize: "16px" }} /> WA
                            </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL DETAIL DONASI */}
        {selectedDonation && (
          <div className="modal-overlay" onClick={() => setSelectedDonation(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 className="modal-title" style={{ margin: 0 }}>📄 Detail Riwayat Donasi</h3>
                  <button onClick={() => setSelectedDonation(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Nama Pendonor</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{selectedDonation.user?.name || "Anonim"}</p>
                  </div>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Kontak</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{selectedDonation.user?.phone || "-"}</p>
                  </div>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Golongan Darah</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold", color: "var(--color-brand-primary)" }}>{selectedDonation.user?.blood_type || selectedDonation.blood_type}{selectedDonation.user?.rhesus || selectedDonation.rhesus || ""}</p>
                  </div>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Volume Donor</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{selectedDonation.quantity_donated || selectedDonation.quantity || 350} ml</p>
                  </div>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Hemoglobin (Hb)</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{selectedDonation.hemoglobin ? `${selectedDonation.hemoglobin} g/dL` : "Tidak dicatat"}</p>
                  </div>
                  <div>
                      <small style={{ color: "var(--color-text-secondary)" }}>Tekanan Darah</small>
                      <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{selectedDonation.blood_pressure || "Tidak dicatat"}</p>
                  </div>
              </div>

              <div style={{ backgroundColor: "var(--color-surface-background)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border-divider)" }}>
                  <small style={{ color: "var(--color-text-secondary)" }}>Catatan Medis</small>
                  <p style={{ margin: "4px 0 0 0" }}>{selectedDonation.notes || "Tidak ada catatan khusus."}</p>
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button className="ms-btn-cancel" onClick={() => setSelectedDonation(null)} style={{ width: "100%" }}>Tutup</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}