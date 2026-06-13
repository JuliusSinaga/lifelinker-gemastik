import React, { useState, useEffect } from "react";
import "../styles/ManajemenPendonor.css";
import SidebarAdmin from "../components/SidebarAdmin"; 
import axiosClient from "../service/axiosClient";

function MetricCard({ value, title, subtitle, icon, iconClass }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-content">
          <div className="metric-value">{value}</div>
          <div className="metric-title">{title}</div>
          <div className="metric-subtitle">{subtitle}</div>
        </div>
        <div className={`metric-icon ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ManajemenPendonor() {
  const [pendonors, setPendonors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [nameFilter, setNameFilter] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("Semua Golongan");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  // Modal State
  const [selectedPendonor, setSelectedPendonor] = useState(null);

  // 1. Fetch Data
  const fetchPendonors = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/users");
      const allUsers = response.data.data || [];
      const donorList = allUsers.filter(user => user.role === 'user');
      setPendonors(donorList);
    } catch (error) {
      console.error("Gagal mengambil data pendonor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendonors();
  }, []);

  // 2. Logic Filter
  const filteredPendonors = pendonors.filter((p) => {
    const nameMatch = nameFilter === "" || (p.name && p.name.toLowerCase().includes(nameFilter.toLowerCase()));
    
    const fullBloodType = (p.blood_type && p.rhesus) ? `${p.blood_type}${p.rhesus}` : "-";
    const bloodMatch = bloodTypeFilter === "Semua Golongan" || fullBloodType === bloodTypeFilter;
    
    const statusLabel = p.status === "active" ? "Aktif" : "Tidak Aktif";
    const statusMatch = statusFilter === "Semua Status" || statusLabel === statusFilter;

    return nameMatch && bloodMatch && statusMatch;
  });

  const totalPendonor = pendonors.length;
  const metrics = [
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumatera Utara", icon: "👥", iconClass: "red" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "👨‍⚕️", iconClass: "red" },
    { value: totalPendonor, title: "Pendonor Aktif", subtitle: "Data Real-time", icon: "🩸", iconClass: "red" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "📅", iconClass: "red" },
    { value: "20,234", title: "Stok Darah", subtitle: "30 Rumah Sakit", icon: "🧪", iconClass: "red" },
    { value: "587", title: "Event Terlaksana", subtitle: "Seluruh Provinsi", icon: "✅", iconClass: "red" },
  ];

  return (
    <div className="mp-container">
      <SidebarAdmin />

      <main className="mp-content">
        <h1 className="mp-title">Dashboard Administrasi - Pendonor</h1>

        {/* METRICS CARDS */}
        <div className="metrics-grid">
          {metrics.map((m, idx) => (
            <div className="metric-card" key={idx}>
              <div className="metric-content">
                <div className="metric-value">{m.value}</div>
                <div className="metric-title">{m.title}</div>
                <div className="metric-subtitle">{m.subtitle}</div>
              </div>
              <div className="metric-icon">{m.icon}</div>
            </div>
          ))}
        </div>

        {/* SECTION TABLE */}
        <div className="mp-table-section">
          <h3 className="mp-section-title">Manajemen Pendonor</h3>

          {/* FILTERS */}
          <div className="mp-filters">
            <div className="mp-filter-group">
              <label>Filter Nama Pendonor</label>
              <input
                type="text"
                placeholder="Cari nama pendonor..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <div className="mp-filter-group">
              <label>Golongan Darah</label>
              <select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
              >
                <option value="Semua Golongan">Semua Golongan</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="mp-filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
                <p className="loading-text">Memuat data pendonor...</p>
            ) : (
                <table className="mp-table">
                <thead>
                    <tr>
                    <th>Nama</th>
                    <th className="center">Gol. Darah</th>
                    <th className="center">Kota Domisili</th>
                    <th className="center">No. HP</th> 
                    <th className="center">Status</th>
                    <th className="center">Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredPendonors.length > 0 ? (
                        filteredPendonors.map((p) => (
                        <tr key={p.id}>
                            <td><strong>{p.name}</strong></td>
                            <td className="center">
                                {(p.blood_type && p.rhesus) ? (
                                    <span className="mp-badge blood">
                                        {p.blood_type}{p.rhesus}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="center">{p.city || "-"}</td>
                            <td className="center">{p.phone || "-"}</td>
                            <td className="center">
                                <span className={`mp-badge ${p.status === "active" ? "active" : "inactive"}`}>
                                    {p.status === "active" ? "Aktif" : "Non-Aktif"}
                                </span>
                            </td>
                            <td className="center">
                                <button
                                    className="mp-btn view"
                                    onClick={() => setSelectedPendonor(p)}
                                >
                                    Detail
                                </button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state">Tidak ada pendonor yang sesuai filter.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </div>

        {/* MODAL */}
        {selectedPendonor && (
          <div className="modal-overlay" onClick={() => setSelectedPendonor(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Detail Pendonor</h2>

              <div className="modal-content">
                <div className="detail-row"><strong>Nama:</strong> {selectedPendonor.name}</div>
                <div className="detail-row"><strong>Email:</strong> {selectedPendonor.email}</div>
                <div className="detail-row"><strong>Golongan Darah:</strong> {selectedPendonor.blood_type}{selectedPendonor.rhesus}</div>
                <div className="detail-row"><strong>Kota Domisili:</strong> {selectedPendonor.city}</div>
                <div className="detail-row"><strong>Nomor HP:</strong> {selectedPendonor.phone}</div>
                <div className="detail-row">
                    <strong>Status Akun:</strong> 
                    <span className={`mp-status-text ${selectedPendonor.status === 'active' ? 'active' : 'inactive'}`}>
                        {selectedPendonor.status === 'active' ? ' Aktif' : ' Non-Aktif'}
                    </span>
                </div>
                
                <hr className="modal-divider"/>
                <p className="mp-info-muted">Riwayat donasi belum tersedia.</p>
              </div>

              <div className="modal-actions">
                <button className="modal-close" onClick={() => setSelectedPendonor(null)}>
                    Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}