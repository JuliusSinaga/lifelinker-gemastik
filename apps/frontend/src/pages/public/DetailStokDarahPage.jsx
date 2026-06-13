import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../../styles/DetailStokDarahPage.css";
import {
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaFilter,
  FaCheckCircle,
  FaArrowLeft,
  FaHospital,
  FaClock,
  FaClipboardList,
  FaTint,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

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
      <div style={{ textAlign: "center", padding: "50px" }}>
        Memuat data stok...
      </div>
    );
  if (!hospital)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Data tidak ditemukan</h2>
        <button onClick={() => navigate("/stok-darah")}>Kembali</button>
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
      <section className="hospital-info-section" style={{ paddingTop: "40px" }}>
        <div className="hospital-container">
          <div className="back-button">
            <Link to="/stok-darah" className="back-link">
              <FaArrowLeft /> Kembali ke Daftar Rumah Sakit
            </Link>
          </div>

          <div className="hospital-info">
            <h1>
              <FaHospital
                style={{
                  display: "inline",
                  marginRight: "12px",
                  color: "var(--primary-red)",
                }}
              />
              {hospital.name}
            </h1>
            <div className="hospital-details">
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span>{hospital.address}</span>
              </div>
              <div className="detail-item">
                <FaClock className="detail-icon" />
                <span>
                  <strong>Jam Operasional:</strong> {hospital.operationalHours}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-contact">
                <FaPhone /> Hubungi
              </button>
              <button className="btn-whatsapp">
                <FaWhatsapp /> WhatsApp
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hospital.name + " " + hospital.address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-maps"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <FaMapMarkerAlt /> Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="stok-main">
        <div className="stok-container">
          {/* --- BAGIAN STATISTIK YANG DIPERBAIKI (GRID LAYOUT) --- */}
          <div
            className="stats-summary-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {/* Kartu Kritis */}
            <div
              className="stat-card critical"
              style={{
                background: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#ef4444",
                }}
              >
                {criticalCount}
              </div>
              <div style={{ color: "#7f1d1d", fontWeight: "600" }}>
                Golongan Kritis
              </div>
            </div>

            {/* Kartu Standar */}
            <div
              className="stat-card standard"
              style={{
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                }}
              >
                {standardCount}
              </div>
              <div style={{ color: "#78350f", fontWeight: "600" }}>
                Golongan Standar
              </div>
            </div>

            {/* Kartu Aman */}
            <div
              className="stat-card safe"
              style={{
                background: "#d1fae5",
                border: "1px solid #10b981",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {safeCount}
              </div>
              <div style={{ color: "#064e3b", fontWeight: "600" }}>
                Golongan Aman
              </div>
            </div>
          </div>
          {/* ----------------------------------------------------- */}

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-label">
              <FaFilter className="filter-icon" />
              <span>Filter Status Stok:</span>
            </div>
            <select
              className="filter-dropdown"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Stock Table */}
          <div className="blood-table-container">
            <table className="blood-table">
              <thead>
                <tr>
                  <th>Golongan Darah</th>
                  <th>Status & Ketersediaan</th>
                  <th>Jumlah (Kantong)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="blood-row">
                      <td className="blood-type-cell">
                        <span
                          className="blood-type-text"
                          style={{
                            background: "#f3f4f6",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: "#374151",
                          }}
                        >
                          <FaTint
                            style={{ color: "#ef4444", marginRight: "5px" }}
                          />
                          {item.type}
                        </span>
                      </td>
                      <td className="status-cell" style={{ width: "50%" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
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
                                  ? "#fee2e2"
                                  : item.statusClass === "safe"
                                  ? "#d1fae5"
                                  : "#fef3c7",
                              color:
                                item.statusClass === "critical"
                                  ? "#ef4444"
                                  : item.statusClass === "safe"
                                  ? "#10b981"
                                  : "#f59e0b",
                            }}
                          >
                            {item.status}
                          </span>
                          <div
                            className="progress-bar"
                            style={{
                              height: "8px",
                              background: "#e5e7eb",
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
                      <td className="units-cell">
                        <span
                          className="units-number"
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "800",
                            color: "#1f2937",
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
                        color: "#666",
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
          <div className="procedure-section">
            <h3>
              <FaClipboardList
                style={{ color: "var(--primary-red)", marginRight: "10px" }}
              />
              Informasi & Prosedur Permintaan
            </h3>
            <div className="procedure-list">
              {procedureInfo.map((info, index) => (
                <div key={index} className="procedure-item">
                  <FaCheckCircle className="check-icon" />
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}