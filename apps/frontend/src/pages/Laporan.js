import React, { useState, useEffect } from "react";
import "../styles/Laporan.css";
import SidebarAdmin from "../components/SidebarAdmin";
import axiosClient from "../service/axiosClient";

// MetricCard Component
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

export default function Laporan() {
  const [pendonors, setPendonors] = useState([]);
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

  // 2. Hitung Metrik Secara Dinamis
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const upcomingEvents = events.filter(e => e.status === 'approved').length;
  const totalPendonor = pendonors.length;
  const metrics = [
    { value: "20,847", title: "User Terdaftar", subtitle: "Seluruh Sumatera Utara", icon: "👥", iconClass: "red" },
    { value: "342", title: "Dokter Terverifikasi", subtitle: "30 Rumah Sakit", icon: "👨‍⚕️", iconClass: "red" },
    { value: totalPendonor, title: "Pendonor Aktif", subtitle: "Data Real-time", icon: "🩸", iconClass: "red" },
    { value: "47", title: "Event", subtitle: "Di berbagai RS", icon: "📅", iconClass: "red" },
    { value: "20,234", title: "Stok Darah", subtitle: "30 Rumah Sakit", icon: "🧪", iconClass: "red" },
    { value: "587", title: "Event Terlaksana", subtitle: "Seluruh Provinsi", icon: "✅", iconClass: "red" },
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

      <main className="main-content">
        <header className="content-header">
          <h1 className="page-title">Laporan</h1>
        </header>

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

        {/* LAPORAN EVENT */}
        <div className="laporan-section">
          <h3 className="section-title">Laporan Event</h3>

          {/* FILTERS */}
          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">Filter Nama Event:</label>
              <input
                type="text"
                placeholder="Cari nama event..."
                className="filter-input"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Filter Tanggal (YYYY-MM-DD):</label>
              <input
                type="text"
                placeholder="2025-01-01"
                className="filter-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Filter Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Akan Datang">Akan Datang</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-container">
            {loading ? (
                <p className="loading-text">Memuat data laporan...</p>
            ) : (
                <table className="laporan-table">
                <thead>
                    <tr>
                    <th>Nama Event</th>
                    <th className="center">Lokasi</th>
                    <th className="center">Tanggal</th>
                    <th className="center">Target</th>
                    <th className="center">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredReports.length > 0 ? (
                        filteredReports.map((r) => (
                        <tr key={r.id}>
                            <td>{r.title}</td>
                            <td className="center">{r.location}</td>
                            <td className="center">{formatDate(r.start_date)}</td>
                            <td className="center">{r.target_bags ? `${r.target_bags} Kantong` : "-"}</td>
                            <td className="center">
                            <span className={`status-badge ${r.status}`}>
                                {getStatusLabel(r.status)}
                            </span>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state">Tidak ada laporan yang sesuai.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}