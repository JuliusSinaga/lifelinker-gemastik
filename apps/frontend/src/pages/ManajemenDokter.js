import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ManajemenDokter.css';
import SidebarAdmin from "../components/SidebarAdmin";
import axiosClient from "../service/axiosClient";
import Card from "../components/core/Card";
import Button from "../components/core/Button";
import Input from "../components/core/Input";
import Icon from "../components/core/Icon";

// MetricCard component
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

// DoctorRow component
function DoctorRow({ doctor, openModal, onVerify }) {
  const isWaiting = doctor.status === "pending";

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Terverifikasi';
    if (status === 'pending') return 'Menunggu Verifikasi';
    return 'Ditolak';
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'var(--color-status-success)';
    if (status === 'pending') return 'var(--color-status-warning)';
    return 'var(--color-status-error)';
  };

  return (
    <tr className="doctor-row" style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
      <td style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                {(doctor.name || "D").charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>{doctor.name}</span>
        </div>
      </td>
      <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{doctor.hospital || "-"}</td>
      <td style={{ padding: "16px", color: "var(--color-text-secondary)" }}>{doctor.specialization || "Umum"}</td>
      <td style={{ padding: "16px" }}>
        <span className="status-badge" style={{ backgroundColor: `${getStatusColor(doctor.status)}15`, color: getStatusColor(doctor.status), padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>
          {getStatusLabel(doctor.status)}
        </span>
      </td>

      <td className="action-cell" style={{ padding: "16px" }}>
        <div className="action-buttons" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            variant="outline"
            className="action-button view-button"
            onClick={() => openModal(doctor)}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            Lihat Info
          </Button>

          <Button
            variant="primary"
            className="action-button verify-button"
            disabled={!isWaiting}
            onClick={() => onVerify(doctor.id)}
            title="Verifikasi Dokter"
            style={{ padding: "6px", backgroundColor: "var(--color-status-success)", borderColor: "var(--color-status-success)", opacity: isWaiting ? 1 : 0.5 }}
          >
            <Icon icon="mdi:check" />
          </Button>

          <Button
            variant="primary"
            className="action-button reject-button"
            disabled={!isWaiting}
            title="Tolak"
            style={{ padding: "6px", backgroundColor: "var(--color-status-error)", borderColor: "var(--color-status-error)", opacity: isWaiting ? 1 : 0.5 }}
          >
            <Icon icon="mdi:close" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function ManajemenDokter() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [nameFilter, setNameFilter] = useState('');
  const [strNumberFilter, setStrNumberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // 1. Fetch Data Real dari Backend
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/users'); 
      const allUsers = response.data.data || [];
      // Filter hanya user dengan role 'dokter'
      const doctorList = allUsers.filter(user => user.role === 'dokter');
      setDoctors(doctorList);
    } catch (error) {
      console.error("Gagal mengambil data dokter:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // 2. Fungsi Verifikasi Dinamis
  const handleVerify = async (id) => {
    if(!window.confirm("Yakin ingin memverifikasi dokter ini? Email notifikasi akan dikirim.")) return;

    try {
        await axiosClient.put(`/users/${id}/verify`);
        alert("Dokter berhasil diverifikasi!");
        fetchDoctors(); // Refresh data agar status berubah
        setSelectedDoctor(null); 
    } catch (error) {
        console.error("Gagal verifikasi:", error);
        alert("Terjadi kesalahan saat verifikasi.");
    }
  };

  // 3. Perhitungan Metrik Dinamis (Real-time)
  const totalDoctors = doctors.length;
  const verifiedDoctors = doctors.filter(d => d.status === 'active').length;
  const pendingDoctors = doctors.filter(d => d.status === 'pending').length;
  
  // Hitung jumlah RS unik dari data dokter yang ada
  const uniqueHospitals = new Set(
    doctors
      .map(d => d.hospital)       // Ambil nama RS
      .filter(h => h && h !== "-") // Hapus yang kosong
  ).size;

  const metrics = [
    { value: totalDoctors, title: 'Total Dokter', subtitle: 'Terdaftar di Sistem', icon: 'mdi:doctor', iconColor: 'var(--color-status-info)' },
    { value: verifiedDoctors, title: 'Terverifikasi', subtitle: 'Siap Bertugas', icon: 'mdi:check-circle', iconColor: 'var(--color-status-success)' },
    { value: pendingDoctors, title: 'Menunggu', subtitle: 'Perlu Verifikasi', icon: 'mdi:timer-sand', iconColor: 'var(--color-status-warning)' },
    // Nilai ini sekarang dinamis, bukan statis '30' lagi
    { value: uniqueHospitals, title: 'Rumah Sakit', subtitle: 'Asal Instansi Dokter', icon: 'mdi:hospital-building', iconColor: 'var(--color-status-error)' },
  ];

  // 4. Filtering Logic di Sisi Client
  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch = nameFilter === '' || (doctor.name && doctor.name.toLowerCase().includes(nameFilter.toLowerCase()));
    const strMatch = strNumberFilter === '' || (doctor.str_number && doctor.str_number.toLowerCase().includes(strNumberFilter.toLowerCase()));
    
    let statusMatch = true;
    if (statusFilter === 'Terverifikasi') statusMatch = doctor.status === 'active';
    if (statusFilter === 'Menunggu Verifikasi') statusMatch = doctor.status === 'pending';

    return nameMatch && strMatch && statusMatch;
  });

  return (
    <div className="manajemen-dokter-container">
      <SidebarAdmin />

      <main className="main-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <header className="content-header" style={{ marginBottom: "32px" }}>
          <h1 className="page-title" style={{ margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)" }}>Manajemen Dokter</h1>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Verifikasi dan kelola akun dokter spesialis & umum.</p>
        </header>

        {/* Kartu Statistik */}
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, idx) => (
            <MetricCard key={idx} {...m} />
          ))}
        </div>

        {/* Tabel Dokter */}
        <Card variant="standard" className="doctors-table-container" style={{ padding: "24px" }}>
          <h3 className="table-title" style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Daftar Dokter</h3>

          {/* Filter Form */}
          <div className="filters-section" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
            <div className="filters-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Nama Dokter:</label>
                <Input
                  type="text"
                  placeholder="Cari nama dokter..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Filter Nomor STR:</label>
                <Input
                  type="text"
                  placeholder="Cari nomor STR..."
                  value={strNumberFilter}
                  onChange={(e) => setStrNumberFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Status:</label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-standard)", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-container" style={{ overflowX: "auto" }}>
            {loading ? (
                <p className="loading-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "40px" }}>Memuat data dokter...</p>
            ) : (
                <table className="doctor-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Nama</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Rumah Sakit</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Spesialis</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Status</th>
                    <th style={{ padding: "16px", fontWeight: "bold" }}>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                        <DoctorRow
                            key={doctor.id}
                            doctor={doctor}
                            openModal={setSelectedDoctor}
                            onVerify={handleVerify}
                        />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="empty-state-cell" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>Tidak ada data dokter ditemukan.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
          </div>
        </Card>

        {/* Modal Detail */}
        {selectedDoctor && (
          <div className="modal-overlay" onClick={() => setSelectedDoctor(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <Card variant="standard" className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "600px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2 className="modal-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", borderBottom: "1px solid var(--color-border-divider)", paddingBottom: "16px" }}>Detail Dokter</h2>

              <div className="modal-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nama:</strong> <span>{selectedDoctor.name}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Email:</strong> <span>{selectedDoctor.email}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nomor HP:</strong> <span>{selectedDoctor.phone}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Kota:</strong> <span>{selectedDoctor.city}</span></div>
                
                <hr className="modal-separator" style={{ border: "none", borderTop: "1px solid var(--color-border-divider)", margin: "8px 0" }}/>
                
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Nomor STR:</strong> <span>{selectedDoctor.str_number}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Spesialisasi:</strong> <span>{selectedDoctor.specialization}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}><strong>Instansi/RS:</strong> <span>{selectedDoctor.hospital}</span></div>
                <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center" }}>
                    <strong>Status:</strong> 
                    <span className={`modal-status-badge`} style={{ backgroundColor: selectedDoctor.status === 'active' ? "var(--color-status-success)15" : "var(--color-status-warning)15", color: selectedDoctor.status === 'active' ? "var(--color-status-success)" : "var(--color-status-warning)", padding: "4px 12px", borderRadius: "16px", fontWeight: "bold", fontSize: "12px", display: "inline-block", width: "fit-content" }}>
                        {selectedDoctor.status === 'active' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                    </span>
                </div>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--color-border-divider)" }}>
                {selectedDoctor.status === 'pending' && (
                    <Button 
                        variant="primary"
                        className="modal-verify-btn" 
                        onClick={() => handleVerify(selectedDoctor.id)}
                        style={{ backgroundColor: "var(--color-status-success)", borderColor: "var(--color-status-success)" }}
                    >
                        Verifikasi Sekarang
                    </Button>
                )}
                <Button variant="outline" className="modal-close" onClick={() => setSelectedDoctor(null)}>
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