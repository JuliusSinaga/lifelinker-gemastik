import React, { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import "../styles/ManajementEventAdmin.css";
import axiosClient from "../service/axiosClient";

function MetricCard({ value, title, subtitle, icon, colorClass }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-content">
          <div className="metric-value">{value}</div>
          <div className="metric-title">{title}</div>
          <div className="metric-subtitle">{subtitle}</div>
        </div>
        <div className={`metric-icon ${colorClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function ManajementEventAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [monthFilter, setMonthFilter] = useState("Semua Bulan");
  
  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 1. Fetch Data dari Backend
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/events");
      const data = response.data.data || [];
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setEvents(sortedData);
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 2. Fungsi Update Status
  const handleUpdateStatus = async (id, newStatus) => {
    const action = newStatus === 'approved' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} event ini?`)) return;

    try {
      await axiosClient.put(`/events/${id}`, { status: newStatus });
      alert(`Event berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}!`);
      fetchEvents(); 
      setSelectedEvent(null);
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getMonthName = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", { month: "short" });
  };

  // 3. Hitung Metrik
  const totalEvents = events.length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;

  const metrics = [
    { value: totalEvents, title: "Total Event", subtitle: "Semua Pengajuan", icon: "📅", colorClass: "blue" },
    { value: pendingEvents, title: "Menunggu", subtitle: "Perlu Persetujuan", icon: "⏳", colorClass: "yellow" },
    { value: approvedEvents, title: "Disetujui", subtitle: "Akan Datang", icon: "✅", colorClass: "green" },
    { value: completedEvents, title: "Selesai", subtitle: "Terlaksana", icon: "🎉", colorClass: "purple" },
  ];

  // 4. Filtering
  const filteredEvents = events.filter((e) => {
    const nameMatch = search === "" || e.title.toLowerCase().includes(search.toLowerCase());
    
    let statusMatch = true;
    if (statusFilter === "Disetujui") statusMatch = e.status === "approved";
    if (statusFilter === "Menunggu") statusMatch = e.status === "pending";
    if (statusFilter === "Ditolak") statusMatch = e.status === "rejected";
    if (statusFilter === "Selesai") statusMatch = e.status === "completed";

    const eventMonth = getMonthName(e.start_date);
    const matchMonth = monthFilter === "Semua Bulan" || eventMonth.includes(monthFilter);

    return nameMatch && statusMatch && matchMonth;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="mea-badge approved">Disetujui</span>;
      case 'pending': return <span className="mea-badge pending">Menunggu</span>;
      case 'rejected': return <span className="mea-badge rejected">Ditolak</span>;
      case 'completed': return <span className="mea-badge completed">Selesai</span>;
      default: return <span className="mea-badge gray">{status}</span>;
    }
  };

  return (
    <div className="mea-container">
      <SidebarAdmin />

      <main className="mea-content">
        <h1 className="mea-title">Dashboard Administrasi - Event</h1>

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

        <div className="mea-table-section">
          <h3 className="mea-section-title">Manajemen Event</h3>

          {/* FILTERS */}
          <div className="mea-filters">
            <div className="mea-filter-group">
              <label>Filter Nama Event</label>
              <input
                type="text"
                placeholder="Cari nama event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mea-filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Semua Status</option>
                <option>Disetujui</option>
                <option>Menunggu</option>
                <option>Ditolak</option>
                <option>Selesai</option>
              </select>
            </div>

            <div className="mea-filter-group">
              <label>Bulan</label>
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option>Semua Bulan</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
                <p className="loading-text">Memuat data event...</p>
            ) : (
                <table className="mea-table">
                <thead>
                    <tr>
                    <th>Nama Event</th>
                    <th>Lokasi</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((e) => (
                        <tr key={e.id}>
                            <td><strong>{e.title}</strong></td>
                            <td>{e.location}</td>
                            <td>{formatDate(e.start_date)}</td>
                            <td>{getStatusBadge(e.status)}</td>

                            <td className="mea-action-cell">
                                <div className="mea-action-wrapper">
                                    <button
                                        className="mea-btn view"
                                        onClick={() => setSelectedEvent(e)}
                                        title="Lihat Detail"
                                    >
                                    👁
                                    </button>

                                    <div className="mea-action-hover">
                                        <button
                                            className={`mea-btn approve ${e.status !== "pending" ? "disabled" : ""}`}
                                            disabled={e.status !== "pending"}
                                            onClick={() => handleUpdateStatus(e.id, 'approved')}
                                            title="Setujui"
                                        >
                                            ✔
                                        </button>

                                        <button
                                            className={`mea-btn reject ${e.status !== "pending" ? "disabled" : ""}`}
                                            disabled={e.status !== "pending"}
                                            onClick={() => handleUpdateStatus(e.id, 'rejected')}
                                            title="Tolak"
                                        >
                                            ✘
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state">Tidak ada data event ditemukan.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </div>

        {/* MODAL */}
        {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Detail Event</h2>

              <div className="modal-content">
                <div className="detail-row"><strong>Nama Event:</strong> {selectedEvent.title}</div>
                <div className="detail-row"><strong>Lokasi:</strong> {selectedEvent.location}</div>
                <div className="detail-row">
                    <strong>Waktu:</strong> {formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}
                </div>
                <div className="detail-row">
                    <strong>Jam:</strong> {selectedEvent.start_time || "-"} s/d {selectedEvent.end_time || "-"}
                </div>
                <div className="detail-row"><strong>Target:</strong> {selectedEvent.target_bags} Kantong</div>
                <div className="detail-row">
                    <strong>Status:</strong> {getStatusBadge(selectedEvent.status)}
                </div>
                
                <div className="modal-desc-box">
                    <strong>Deskripsi:</strong><br/>
                    {selectedEvent.description || "Tidak ada deskripsi."}
                </div>
              </div>

              <div className="modal-actions">
                {selectedEvent.status === 'pending' && (
                    <>
                        <button className="mea-btn-modal approve" onClick={() => handleUpdateStatus(selectedEvent.id, 'approved')}>
                            Setujui
                        </button>
                        <button className="mea-btn-modal reject" onClick={() => handleUpdateStatus(selectedEvent.id, 'rejected')}>
                            Tolak
                        </button>
                    </>
                )}
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>
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