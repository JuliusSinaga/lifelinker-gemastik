import React, { useState, useEffect } from "react";
import "../styles/ManajemenPendonor.css";
import SidebarAdmin from "../components/SidebarAdmin"; 
import axiosClient from "../service/axiosClient";
import Card from "../components/core/Card";
import Button from "../components/core/Button";
import Input from "../components/core/Input";
import Icon from "../components/core/Icon";

function MetricCard({ value, title, subtitle, icon, iconColor }) {
  return (
    <Card variant="standard" className="metric-card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="metric-content" style={{ flex: 1 }}>
        <div className="metric-value" style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", marginBottom: "4px" }}>{value}</div>
        <div className="metric-title" style={{ fontSize: "14px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>{title}</div>
        <div className="metric-subtitle" style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>{subtitle}</div>
      </div>
      <div className="metric-icon" style={{ fontSize: "40px", color: iconColor, opacity: 0.8, backgroundColor: `${iconColor}15`, width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
        <Icon icon={icon} />
      </div>
    </Card>
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
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumatera Utara", icon: "mdi:account-group", iconColor: "var(--color-brand-primary)" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "mdi:doctor", iconColor: "var(--color-status-info)" },
    { value: totalPendonor, title: "Pendonor Aktif", subtitle: "Data Real-time", icon: "mdi:water", iconColor: "var(--color-status-error)" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "mdi:calendar", iconColor: "var(--color-status-warning)" },
    { value: "20,234", title: "Stok Darah", subtitle: "30 Rumah Sakit", icon: "mdi:flask", iconColor: "var(--color-status-error)" },
    { value: "587", title: "Event Terlaksana", subtitle: "Seluruh Provinsi", icon: "mdi:check-circle", iconColor: "var(--color-status-success)" },
  ];

  return (
    <div className="mp-container">
      <SidebarAdmin />

      <main className="mp-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <h1 className="mp-title" style={{ margin: "0 0 32px 0", fontFamily: "var(--font-family-brand)" }}>Dashboard Administrasi - Pendonor</h1>

        {/* METRICS CARDS */}
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, idx) => (
            <MetricCard key={idx} {...m} />
          ))}
        </div>

        {/* SECTION TABLE */}
        <Card variant="standard" className="mp-table-section" style={{ padding: "24px" }}>
          <h3 className="mp-section-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Manajemen Pendonor</h3>

          {/* FILTERS */}
          <div className="mp-filters" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
            <div className="mp-filter-group" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Nama Pendonor</label>
                <Input
                  type="text"
                  placeholder="Cari nama pendonor..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Golongan Darah</label>
                <select
                  value={bloodTypeFilter}
                  onChange={(e) => setBloodTypeFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
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

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            {loading ? (
                <p className="loading-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px" }}>Memuat data pendonor...</p>
            ) : (
                <table className="mp-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Nama</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Gol. Darah</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Kota Domisili</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>No. HP</th> 
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Status</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredPendonors.length > 0 ? (
                        filteredPendonors.map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                            <td style={{ padding: "16px", fontWeight: "500", color: "var(--color-text-primary)" }}>{p.name}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center" }}>
                                {(p.blood_type && p.rhesus) ? (
                                    <span className="mp-badge blood" style={{ backgroundColor: "var(--color-status-error)15", color: "var(--color-status-error)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>
                                        {p.blood_type}{p.rhesus}
                                    </span>
                                ) : (
                                    <span className="text-muted" style={{ color: "var(--color-text-tertiary)" }}>-</span>
                                )}
                            </td>
                            <td className="center" style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)" }}>{p.city || "-"}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)" }}>{p.phone || "-"}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center" }}>
                                <span className={`mp-badge`} style={{ backgroundColor: p.status === "active" ? "var(--color-status-success)15" : "var(--color-surface-background)", color: p.status === "active" ? "var(--color-status-success)" : "var(--color-text-secondary)", padding: "4px 12px", borderRadius: "16px", fontWeight: "bold", fontSize: "12px" }}>
                                    {p.status === "active" ? "Aktif" : "Non-Aktif"}
                                </span>
                            </td>
                            <td className="center" style={{ padding: "16px", textAlign: "center" }}>
                                <Button
                                    variant="outline"
                                    className="mp-btn view"
                                    onClick={() => setSelectedPendonor(p)}
                                    style={{ padding: "6px 12px", fontSize: "12px" }}
                                >
                                    Detail
                                </Button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="empty-state" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>Tidak ada pendonor yang sesuai filter.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </Card>

        {/* MODAL */}
        {selectedPendonor && (
          <div className="modal-overlay" onClick={() => setSelectedPendonor(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <Card variant="standard" className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2 className="modal-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", borderBottom: "1px solid var(--color-border-divider)", paddingBottom: "16px" }}>Detail Pendonor</h2>

              <div className="modal-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nama:</strong> <span>{selectedPendonor.name}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Email:</strong> <span>{selectedPendonor.email}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Golongan Darah:</strong> <span>{selectedPendonor.blood_type}{selectedPendonor.rhesus}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Kota Domisili:</strong> <span>{selectedPendonor.city}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nomor HP:</strong> <span>{selectedPendonor.phone}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center" }}>
                    <strong>Status Akun:</strong> 
                    <span className={`mp-status-text`} style={{ backgroundColor: selectedPendonor.status === 'active' ? "var(--color-status-success)15" : "var(--color-surface-background)", color: selectedPendonor.status === 'active' ? "var(--color-status-success)" : "var(--color-text-secondary)", padding: "4px 12px", borderRadius: "16px", fontWeight: "bold", fontSize: "12px", display: "inline-block", width: "fit-content" }}>
                        {selectedPendonor.status === 'active' ? ' Aktif' : ' Non-Aktif'}
                    </span>
                </div>
                
                <hr className="modal-divider" style={{ border: "none", borderTop: "1px solid var(--color-border-divider)", margin: "8px 0" }}/>
                <p className="mp-info-muted" style={{ color: "var(--color-text-secondary)", fontStyle: "italic", textAlign: "center" }}>Riwayat donasi belum tersedia.</p>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--color-border-divider)" }}>
                <Button variant="primary" className="modal-close" onClick={() => setSelectedPendonor(null)}>
                    Tutup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}