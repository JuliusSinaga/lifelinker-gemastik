import React, { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import "../../styles/ManajementEventAdmin.css";
import axiosClient from "../../service/axiosClient";
import Card from "../../components/core/Card";
import Button from "../../components/core/Button";
import Input from "../../components/core/Input";
import Icon from "../../components/core/Icon";

function MetricCard({ value, title, subtitle, icon, colorClass }) {
  const colorMap = {
    blue: "var(--color-status-info)",
    yellow: "var(--color-status-warning)",
    green: "var(--color-status-success)",
    purple: "var(--color-brand-primary)"
  };
  const iconColor = colorMap[colorClass] || "var(--color-brand-primary)";

  return (
    <Card variant="standard" className="metric-card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="metric-content" style={{ flex: 1 }}>
        <div className="metric-value" style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", marginBottom: "4px" }}>{value}</div>
        <div className="metric-title" style={{ fontSize: "14px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>{title}</div>
        <div className="metric-subtitle" style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>{subtitle}</div>
      </div>
      <div className="metric-icon" style={{ fontSize: "40px", color: iconColor, opacity: 0.8, backgroundColor: `${iconColor}15`, width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
        <Icon icon={icon} width="32" height="32" />
      </div>
    </Card>
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
    { value: totalEvents, title: "Total Event", subtitle: "Semua Pengajuan", icon: "mdi:calendar", colorClass: "blue" },
    { value: pendingEvents, title: "Menunggu", subtitle: "Perlu Persetujuan", icon: "mdi:timer-sand", colorClass: "yellow" },
    { value: approvedEvents, title: "Disetujui", subtitle: "Akan Datang", icon: "mdi:check-circle", colorClass: "green" },
    { value: completedEvents, title: "Selesai", subtitle: "Terlaksana", icon: "mdi:party-popper", colorClass: "purple" },
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
      case 'approved': return <span className="mea-badge" style={{ backgroundColor: "var(--color-status-success)15", color: "var(--color-status-success)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>Disetujui</span>;
      case 'pending': return <span className="mea-badge" style={{ backgroundColor: "var(--color-status-warning)15", color: "var(--color-status-warning)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>Menunggu</span>;
      case 'rejected': return <span className="mea-badge" style={{ backgroundColor: "var(--color-status-error)15", color: "var(--color-status-error)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>Ditolak</span>;
      case 'completed': return <span className="mea-badge" style={{ backgroundColor: "var(--color-brand-primary)15", color: "var(--color-brand-primary)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>Selesai</span>;
      default: return <span className="mea-badge" style={{ backgroundColor: "var(--color-surface-background)", color: "var(--color-text-secondary)", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>{status}</span>;
    }
  };

  return (
    <div className="mea-container">
      <SidebarAdmin />

      <main className="mea-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <h1 className="mea-title" style={{ margin: "0 0 32px 0", fontFamily: "var(--font-family-brand)" }}>Dashboard Administrasi - Event</h1>

        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, idx) => (
            <MetricCard key={idx} {...m} />
          ))}
        </div> 

        <Card variant="standard" className="mea-table-section" style={{ padding: "24px" }}>
          <h3 className="mea-section-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Manajemen Event</h3>

          {/* FILTERS */}
          <div className="mea-filters" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
            <div className="mea-filter-group" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Nama Event</label>
                <Input
                  type="text"
                  placeholder="Cari nama event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Status</label>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
                >
                  <option>Semua Status</option>
                  <option>Disetujui</option>
                  <option>Menunggu</option>
                  <option>Ditolak</option>
                  <option>Selesai</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Bulan</label>
                <select 
                    value={monthFilter} 
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
                >
                  <option>Semua Bulan</option>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(m => (
                      <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            {loading ? (
                <p className="loading-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px" }}>Memuat data event...</p>
            ) : (
                <table className="mea-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Nama Event</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Lokasi</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Tanggal</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Status</th>
                    <th style={{ padding: "16px", fontWeight: "bold", textAlign: "center" }}>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((e) => (
                        <tr key={e.id} style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                            <td style={{ padding: "16px", fontWeight: "500", color: "var(--color-text-primary)" }}>{e.title}</td>
                            <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{e.location}</td>
                            <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{formatDate(e.start_date)}</td>
                            <td style={{ padding: "16px" }}>{getStatusBadge(e.status)}</td>

                            <td className="mea-action-cell" style={{ padding: "16px" }}>
                                <div className="mea-action-wrapper" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                    <Button
                                        variant="outline"
                                        className="mea-btn view"
                                        onClick={() => setSelectedEvent(e)}
                                        title="Lihat Detail"
                                        style={{ padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        <Icon icon="mdi:eye" />
                                    </Button>

                                    <div className="mea-action-hover" style={{ display: "flex", gap: "8px" }}>
                                        <Button
                                            variant="primary"
                                            className="mea-btn approve"
                                            disabled={e.status !== "pending"}
                                            onClick={() => handleUpdateStatus(e.id, 'approved')}
                                            title="Setujui"
                                            style={{ padding: "6px", backgroundColor: "var(--color-status-success)", borderColor: "var(--color-status-success)", opacity: e.status !== "pending" ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            <Icon icon="mdi:check" />
                                        </Button>

                                        <Button
                                            variant="primary"
                                            className="mea-btn reject"
                                            disabled={e.status !== "pending"}
                                            onClick={() => handleUpdateStatus(e.id, 'rejected')}
                                            title="Tolak"
                                            style={{ padding: "6px", backgroundColor: "var(--color-status-error)", borderColor: "var(--color-status-error)", opacity: e.status !== "pending" ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            <Icon icon="mdi:close" />
                                        </Button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>Tidak ada data event ditemukan.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </Card>

        {/* MODAL */}
        {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <Card variant="standard" className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "600px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "90vh", overflowY: "auto" }}>
              <h2 className="modal-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", borderBottom: "1px solid var(--color-border-divider)", paddingBottom: "16px" }}>Detail Event</h2>

              <div className="modal-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nama Event:</strong> <span>{selectedEvent.title}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Lokasi:</strong> <span>{selectedEvent.location}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                    <strong>Waktu:</strong> <span>{formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}</span>
                </div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                    <strong>Jam:</strong> <span>{selectedEvent.start_time || "-"} s/d {selectedEvent.end_time || "-"}</span>
                </div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Target:</strong> <span>{selectedEvent.target_bags} Kantong</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center" }}>
                    <strong>Status:</strong> {getStatusBadge(selectedEvent.status)}
                </div>
                
                <div className="modal-desc-box" style={{ backgroundColor: "var(--color-surface-background)", padding: "16px", borderRadius: "var(--radius-standard)", marginTop: "8px" }}>
                    <strong style={{ display: "block", marginBottom: "8px" }}>Deskripsi:</strong>
                    <span style={{ color: "var(--color-text-secondary)", lineHeight: "1.5" }}>{selectedEvent.description || "Tidak ada deskripsi."}</span>
                </div>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--color-border-divider)" }}>
                {selectedEvent.status === 'pending' && (
                    <>
                        <Button variant="primary" className="mea-btn-modal approve" onClick={() => handleUpdateStatus(selectedEvent.id, 'approved')} style={{ backgroundColor: "var(--color-status-success)", borderColor: "var(--color-status-success)" }}>
                            Setujui
                        </Button>
                        <Button variant="primary" className="mea-btn-modal reject" onClick={() => handleUpdateStatus(selectedEvent.id, 'rejected')} style={{ backgroundColor: "var(--color-status-error)", borderColor: "var(--color-status-error)" }}>
                            Tolak
                        </Button>
                    </>
                )}
                <Button variant="outline" className="modal-close" onClick={() => setSelectedEvent(null)}>
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