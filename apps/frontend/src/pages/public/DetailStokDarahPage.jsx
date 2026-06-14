import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../../styles/DetailStokDarahPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";

const procedureInfo = [
  "Siapkan surat permintaan darah resmi dari dokter yang merawat.",
  "Sangat disarankan untuk menghubungi unit darah rumah sakit terlebih dahulu.",
  "Bawa identitas diri (KTP/SIM) keluarga pasien yang mengambil.",
];

export default function DetailStokDarahPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Data
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Tampilkan Semua");

  const filterOptions = [
    "Tampilkan Semua",
    "Kritis Saja",
    "Standar Saja",
    "Aman Saja",
  ];

  // 1. Fetch Data dari Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lokasiRes, stokRes] = await Promise.all([
          axiosClient.get(`/lokasi/${id}`),
          axiosClient.get("/stok-darah"),
        ]);

        const lokasiData = lokasiRes.data.data;
        const rawStock = stokRes.data.data || [];

        // Mapping Data Stok
        const mappedStock = rawStock.map((item) => {
          const statusClass = getStatusClass(item.ketersediaan);
          const percentage = Math.min((item.jumlah_kantong / 100) * 100, 100);

          return {
            type: `${item.gol_darah}${item.rhesus}`,
            status: item.ketersediaan,
            units: item.jumlah_kantong,
            percentage: percentage,
            statusClass: statusClass,
          };
        });

        // Sorting Order: A+, A-, B+, ...
        const order = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        mappedStock.sort(
          (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
        );

        setHospital({
          id: lokasiData.ID,
          name: lokasiData.nama_lokasi,
          address: lokasiData.alamat_lokasi,
          operationalHours:
            lokasiData.jam_operasional_lokasi || "08:00 - 16:00 WIB",
          phone: lokasiData.kontak_lokasi,
          bloodStockData: mappedStock,
        });
      } catch (error) {
        console.error("Gagal mengambil data detail stok:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Helper Functions
  const getStatusClass = (status) => {
    switch (status) {
      case "Kritis":
        return "critical";
      case "Kurang":
        return "critical";
      case "Standar":
        return "standard";
      case "Aman":
        return "safe";
      default:
        return "standard";
    }
  };

  const getProgressBarColor = (statusClass) => {
    switch (statusClass) {
      case "critical":
        return "#ef4444"; // Merah
      case "standard":
        return "#f59e0b"; // Kuning
      case "safe":
        return "#10b981"; // Hijau
      default:
        return "#ccc";
    }
  };

  // Render Loading / Error
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px", fontFamily: "var(--font-family-primary)", color: "var(--color-text-secondary)" }}>
        Memuat data stok...
      </div>
    );
  if (!hospital)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2 style={{ fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)" }}>Data tidak ditemukan</h2>
        <Button onClick={() => navigate("/stok-darah")} variant="primary">Kembali</Button>
      </div>
    );

  // Filter Logic
  const filteredData = hospital.bloodStockData.filter((item) => {
    if (selectedFilter === "Tampilkan Semua") return true;
    if (selectedFilter === "Kritis Saja")
      return item.status === "Kritis" || item.status === "Kurang";
    if (selectedFilter === "Standar Saja") return item.status === "Standar";
    if (selectedFilter === "Aman Saja") return item.status === "Aman";
    return true;
  });

  // Calculate statistics
  const criticalCount = hospital.bloodStockData.filter(
    (item) => item.status === "Kritis" || item.status === "Kurang"
  ).length;
  const standardCount = hospital.bloodStockData.filter(
    (item) => item.status === "Standar"
  ).length;
  const safeCount = hospital.bloodStockData.filter(
    (item) => item.status === "Aman"
  ).length;

  return (
    <div className="detail-stok-root">
      <Header />

      {/* Hospital Info Section */}
      <section className="hospital-info-section" style={{ paddingTop: "40px", backgroundColor: "var(--color-bg-page)" }}>
        <div className="hospital-container">
          <div className="back-button" style={{ marginBottom: "20px" }}>
            <Button as={Link} to="/stok-darah" variant="ghost" style={{ paddingLeft: 0, color: "var(--color-text-secondary)" }}>
              <Icon icon="mdi:arrow-left" width="20" style={{ marginRight: "8px" }} /> Kembali ke Daftar Rumah Sakit
            </Button>
          </div>

          <div className="hospital-info" style={{ backgroundColor: "var(--color-surface-card)", padding: "32px", borderRadius: "var(--radius-large)", boxShadow: "var(--shadow-base)", border: "1px solid var(--color-border-divider)" }}>
            <h1 style={{ fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 24px 0" }}>
              <Icon icon="mdi:hospital-building" width="32" style={{ color: "var(--color-brand-primary)" }} />
              {hospital.name}
            </h1>
            <div className="hospital-details" style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-text-secondary)", marginBottom: "32px" }}>
              <div className="detail-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Icon icon="mdi:map-marker" width="20" style={{ color: "var(--color-brand-primary)", marginTop: "2px" }} />
                <span>{hospital.address}</span>
              </div>
              <div className="detail-item" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon icon="mdi:clock-outline" width="20" style={{ color: "var(--color-brand-primary)" }} />
                <span>
                  <strong>Jam Operasional:</strong> {hospital.operationalHours}
                </span>
              </div>
            </div>

            <div className="action-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <Button variant="primary" className="btn-contact">
                <Icon icon="mdi:phone" width="20" style={{ marginRight: "8px" }} /> Hubungi
              </Button>
              <Button variant="secondary" className="btn-whatsapp" style={{ backgroundColor: "#25D366", color: "white", borderColor: "#25D366" }}>
                <Icon icon="mdi:whatsapp" width="20" style={{ marginRight: "8px" }} /> WhatsApp
              </Button>
              <Button as="a"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hospital.name + " " + hospital.address
                )}`}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
              >
                <Icon icon="mdi:map-marker" width="20" style={{ marginRight: "8px" }} /> Google Maps
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="stok-main" style={{ backgroundColor: "var(--color-bg-page)" }}>
        <div className="stok-container">
          {/* --- BAGIAN STATISTIK YANG DIPERBAIKI (GRID LAYOUT) --- */}
          <div
            className="stats-summary-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            {/* Kartu Kritis */}
            <div
              className="stat-card critical"
              style={{
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                borderRadius: "var(--radius-large)",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-family-brand)",
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "var(--color-status-error)",
                  marginBottom: "8px"
                }}
              >
                {criticalCount}
              </div>
              <div style={{ color: "var(--color-status-error)", fontWeight: "600", fontFamily: "var(--font-family-primary)" }}>
                Golongan Kritis
              </div>
            </div>

            {/* Kartu Standar */}
            <div
              className="stat-card standard"
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "var(--radius-large)",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-family-brand)",
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "var(--color-status-warning)",
                  marginBottom: "8px"
                }}
              >
                {standardCount}
              </div>
              <div style={{ color: "#B45309", fontWeight: "600", fontFamily: "var(--font-family-primary)" }}>
                Golongan Standar
              </div>
            </div>

            {/* Kartu Aman */}
            <div
              className="stat-card safe"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "var(--radius-large)",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-family-brand)",
                  fontSize: "3rem",
                  fontWeight: "bold",
                  color: "var(--color-status-success)",
                  marginBottom: "8px"
                }}
              >
                {safeCount}
              </div>
              <div style={{ color: "var(--color-status-success)", fontWeight: "600", fontFamily: "var(--font-family-primary)" }}>
                Golongan Aman
              </div>
            </div>
          </div>
          {/* ----------------------------------------------------- */}

          {/* Filter Section */}
          <div className="filter-section" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div className="filter-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "var(--color-text-primary)" }}>
              <Icon icon="mdi:filter" className="filter-icon" />
              <span>Filter Status Stok:</span>
            </div>
            <select
              className="filter-dropdown"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", backgroundColor: "var(--color-surface-card)" }}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Stock Table */}
          <div className="blood-table-container" style={{ backgroundColor: "var(--color-surface-card)", borderRadius: "var(--radius-large)", overflow: "hidden", border: "1px solid var(--color-border-divider)", marginBottom: "40px" }}>
            <table className="blood-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--color-surface-background)" }}>
                <tr>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>Golongan Darah</th>
                  <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>Status & Ketersediaan</th>
                  <th style={{ padding: "16px", textAlign: "right", borderBottom: "1px solid var(--color-border-divider)", color: "var(--color-text-secondary)" }}>Jumlah (Kantong)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="blood-row" style={{ borderBottom: "1px solid var(--color-border-divider)" }}>
                      <td className="blood-type-cell" style={{ padding: "20px 16px" }}>
                        <span
                          className="blood-type-text"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "var(--color-surface-background)",
                            padding: "10px 16px",
                            borderRadius: "var(--radius-standard)",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border-divider)"
                          }}
                        >
                          <Icon icon="mdi:water"
                            style={{ color: "var(--color-brand-primary)", marginRight: "8px" }}
                          />
                          {item.type}
                        </span>
                      </td>
                      <td className="status-cell" style={{ width: "50%", padding: "20px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <span
                            className={`status-badge ${item.statusClass}`}
                            style={{
                              alignSelf: "flex-start",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              backgroundColor:
                                item.statusClass === "critical"
                                  ? "rgba(220, 38, 38, 0.1)"
                                  : item.statusClass === "safe"
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(245, 158, 11, 0.1)",
                              color:
                                item.statusClass === "critical"
                                  ? "var(--color-status-error)"
                                  : item.statusClass === "safe"
                                  ? "var(--color-status-success)"
                                  : "var(--color-status-warning)",
                            }}
                          >
                            {item.status}
                          </span>
                          <div
                            className="progress-bar"
                            style={{
                              height: "8px",
                              background: "var(--color-border-divider)",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="progress-fill"
                              style={{
                                width: `${item.percentage}%`,
                                height: "100%",
                                backgroundColor: getProgressBarColor(
                                  item.statusClass
                                ),
                                borderRadius: "4px",
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="units-cell" style={{ padding: "20px 16px", textAlign: "right", verticalAlign: "middle" }}>
                        <span
                          className="units-number"
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "800",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {item.units}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Tidak ada data yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Procedure Section */}
          <div className="procedure-section" style={{ backgroundColor: "var(--color-surface-background)", padding: "32px", borderRadius: "var(--radius-large)", border: "1px solid var(--color-border-divider)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 24px 0", color: "var(--color-text-primary)" }}>
              <Icon icon="mdi:clipboard-text" width="24"
                style={{ color: "var(--color-brand-primary)" }}
              />
              Informasi & Prosedur Permintaan
            </h3>
            <div className="procedure-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {procedureInfo.map((info, index) => (
                <div key={index} className="procedure-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "var(--color-text-secondary)" }}>
                  <Icon icon="mdi:check-circle" width="20" style={{ color: "var(--color-status-success)", marginTop: "2px", flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.5 }}>{info}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}