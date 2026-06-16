import React, { useState, useEffect } from "react";
import "../../styles/Laporan.css";
import SidebarAdmin from "../../components/SidebarAdmin";
import axiosClient from "../../service/axiosClient";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";
import Icon from "../../components/core/Icon";

// MetricCard Component
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

export default function Laporan() {
  const [pendonors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  // 1. Fetch Data Event dari Backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/events");
        const data = response.data.data || [];
        setEvents(data);
      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Helper: Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  // Helper: Status Label
  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Selesai';
      case 'approved': return 'Akan Datang';
      case 'rejected': return 'Dibatalkan';
      case 'pending': return 'Menunggu';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'var(--color-brand-primary)';
      case 'approved': return 'var(--color-status-success)';
      case 'rejected': return 'var(--color-status-error)';
      case 'pending': return 'var(--color-status-warning)';
      default: return 'var(--color-text-secondary)';
    }
  };

  // 2. Hitung Metrik Secara Dinamis
  const totalPendonor = pendonors.length;
  const metrics = [
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumatera Utara", icon: "mdi:account-group", iconColor: "var(--color-brand-primary)" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "mdi:doctor", iconColor: "var(--color-status-info)" },
    { value: totalPendonor, title: "Pendonor Aktif", subtitle: "Data Real-time", icon: "mdi:water", iconColor: "var(--color-status-error)" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "mdi:calendar", iconColor: "var(--color-status-warning)" },
    { value: "20,234", title: "Stok Darah", subtitle: "30 Rumah Sakit", icon: "mdi:flask", iconColor: "var(--color-status-error)" },
    { value: "587", title: "Event Terlaksana", subtitle: "Seluruh Provinsi", icon: "mdi:check-circle", iconColor: "var(--color-status-success)" },
  ];

  // 3. Filter Logic
  const filteredReports = events.filter((r) => {
    const matchName = nameFilter === "" || r.title.toLowerCase().includes(nameFilter.toLowerCase());
    const matchDate = dateFilter === "" || (r.start_date && r.start_date.includes(dateFilter));
    
    let matchStatus = true;
    if (statusFilter !== "Semua Status") {
      // Mapping filter frontend ke status backend
      if (statusFilter === "Selesai") matchStatus = r.status === "completed";
      else if (statusFilter === "Dibatalkan") matchStatus = r.status === "rejected";
      else if (statusFilter === "Akan Datang") matchStatus = r.status === "approved";
      else if (statusFilter === "Menunggu") matchStatus = r.status === "pending";
    }

    return matchName && matchDate && matchStatus;
  });

  return (
    <div className="laporan-container">
      <SidebarAdmin />

      <main className="main-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <header className="content-header" style={{ marginBottom: "32px" }}>
          <h1 className="page-title" style={{ margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)" }}>Laporan</h1>
        </header>

        {/* METRICS CARDS */}
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, idx) => (
            <MetricCard key={idx} {...m} />
          ))}
        </div>

        {/* LAPORAN EVENT */}
        <Card variant="standard" className="laporan-section" style={{ padding: "24px" }}>
          <h3 className="section-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Laporan Event</h3>

          {/* FILTERS */}
          <div className="filter-section" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
            <div className="filter-group-wrapper" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Nama Event:</label>
                <Input
                  type="text"
                  placeholder="Cari nama event..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Tanggal (YYYY-MM-DD):</label>
                <Input
                  type="text"
                  placeholder="2025-01-01"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Akan Datang">Akan Datang</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container" style={{ overflowX: "auto" }}>
            {loading ? (
                <p className="loading-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px" }}>Memuat data laporan...</p>
            ) : (
                <table className="laporan-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Nama Event</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Lokasi</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Tanggal</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Target</th>
                    <th className="center" style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredReports.length > 0 ? (
                        filteredReports.map((r) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                            <td style={{ padding: "16px", fontWeight: "500", color: "var(--color-text-primary)" }}>{r.title}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)" }}>{r.location}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)" }}>{formatDate(r.start_date)}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center", color: "var(--color-text-secondary)" }}>{r.target_bags ? `${r.target_bags} Kantong` : "-"}</td>
                            <td className="center" style={{ padding: "16px", textAlign: "center" }}>
                            <span className="status-badge" style={{ backgroundColor: `${getStatusColor(r.status)}15`, color: getStatusColor(r.status), padding: "4px 12px", borderRadius: "16px", fontWeight: "bold", fontSize: "12px", display: "inline-block" }}>
                                {getStatusLabel(r.status)}
                            </span>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>Tidak ada laporan yang sesuai.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}