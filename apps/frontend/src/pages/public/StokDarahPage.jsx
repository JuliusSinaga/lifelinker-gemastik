import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/StokDarahPage.css";
import {
  FaMapMarkerAlt,
  FaFilter,
  FaClock,
  FaChevronRight,
  FaMapPin,
  FaHospital,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient"; // 1. Import API Client

export default function StokDarahPage() {
  const [selectedFilter, setSelectedFilter] = useState("Semua Kota");
  const [selectedBloodType, setSelectedBloodType] = useState("Semua Golongan");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State Data Dinamis
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = ["Semua Kota", "Medan", "Balige"];
  const bloodTypeOptions = ["Semua Golongan", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // 1. Cek Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 2. Fetch Data dari Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data Lokasi dan Stok Darah secara paralel
        const [lokasiRes, stokRes] = await Promise.all([
          axiosClient.get("/lokasi"),
          axiosClient.get("/stok-darah")
        ]);

        const lokasiData = lokasiRes.data.data || [];
        const stokDataRaw = stokRes.data.data || [];

        // Format Data Stok agar mudah dibaca UI
        // Ubah dari Array backend ke Object: { "A+": { status: "Aman", units: 50, ... } }
        const formattedStock = {};
        const urgentList = [];

        stokDataRaw.forEach((item) => {
          const type = `${item.gol_darah}${item.rhesus}`;
          formattedStock[type] = {
            status: item.ketersediaan,
            units: item.jumlah_kantong,
            statusClass: getStatusClass(item.ketersediaan)
          };

          if (item.ketersediaan === "Kritis" || item.ketersediaan === "Kurang") {
            urgentList.push(type);
          }
        });

        // Gabungkan Data Lokasi dengan Stok
        const mappedHospitals = lokasiData.map((loc, index) => {
          // Deteksi kota sederhana
          const city = loc.alamat_lokasi.includes("Balige") ? "Balige" : "Medan";

          return {
            id: loc.ID,
            name: loc.nama_lokasi,
            city: city,
            address: loc.alamat_lokasi,
            operationalHours: loc.jam_operasional_lokasi || "08:00 - 15:00 WIB",
            distance: `${(2 + index * 2.5).toFixed(1)} km`, // Jarak dummy
            bloodStock: formattedStock, // Gunakan data stok DB
            urgentNeeds: urgentList,
          };
        });

        setHospitals(mappedHospitals);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper Class CSS
  const getStatusClass = (status) => {
    switch (status) {
      case "Kritis": return "critical";
      case "Kurang": return "critical"; // Mapping Kurang ke Critical style
      case "Standar": return "standard";
      case "Aman": return "safe";
      default: return "standard";
    }
  };

  // Filter Logic
  const filteredHospitals = hospitals.filter((hospital) => {
    const cityMatch = selectedFilter === "Semua Kota" || hospital.city === selectedFilter;
    
    let bloodTypeMatch = true;
    if (selectedBloodType !== "Semua Golongan") {
      const stockItem = hospital.bloodStock && hospital.bloodStock[selectedBloodType];
      // Tampilkan jika datanya ada
      bloodTypeMatch = !!stockItem; 
    }

    return cityMatch && bloodTypeMatch;
  });

  return (
    <div className="stok-darah-root">
      {/* Shared Header Component */}
      <Header showUserProfile={isLoggedIn} />

      {/* Hero Section */}
      <section className="stok-hero">
        <div className="stok-hero-content">
          <h1>🩸 Stok Darah Rumah Sakit</h1>
          <p>Cek ketersediaan stok darah di rumah sakit dan PMI terdekat</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="stok-main">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-container">
            <div className="filter-card">
              <div className="filter-item">
                <span className="filter-label">
                  <FaFilter className="filter-icon" />
                  Filter Kota:
                </span>
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

              <div className="filter-item">
                <span className="filter-label">
                  <FaHospital className="filter-icon" />
                  Golongan Darah:
                </span>
                <select
                  className="filter-dropdown"
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                >
                  {bloodTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>Memuat Stok Darah...</div>
        ) : (
          <div className="stok-container">
            {/* Results Info */}
            <div
              style={{
                marginBottom: "20px",
                color: "#666",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Menampilkan {filteredHospitals.length} rumah sakit
            </div>

            {/* Hospital Cards */}
            <div className="hospitals-grid">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital) => (
                  <div key={hospital.id} className="hospital-card">
                    <div className="hospital-card-header">
                      <div className="hospital-basic-info">
                        <span className="hospital-city-tag">{hospital.city}</span>
                        <h3>{hospital.name}</h3>
                        <div className="hospital-meta">
                          <div className="meta-item">
                            <FaMapMarkerAlt className="meta-icon" />
                            <span>{hospital.address}</span>
                          </div>
                          <div className="meta-item">
                            <FaClock className="meta-icon" />
                            <span>{hospital.operationalHours}</span>
                          </div>
                          <div className="meta-item">
                            <FaMapPin className="meta-icon" />
                            <span>{hospital.distance}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blood Stock Summary */}
                    <div className="blood-stock-summary">
                      <h4>Status Stok Darah:</h4>
                      <div className="blood-types-grid">
                        {hospital.bloodStock && Object.entries(hospital.bloodStock).map(
                          ([type, data]) => (
                            <div
                              key={type}
                              className={`blood-type-badge ${data.statusClass}`}
                            >
                              <span className="blood-type">{type}</span>
                              <span className="blood-units">
                                {data.units} Kantong
                              </span>
                              <span className="blood-status">{data.status}</span>
                            </div>
                          )
                        )}
                        {(!hospital.bloodStock || Object.keys(hospital.bloodStock).length === 0) && (
                            <p style={{fontSize:'12px', color:'#888'}}>Data stok belum tersedia.</p>
                        )}
                      </div>
                    </div>

                    {/* Urgent Needs */}
                    {hospital.urgentNeeds && hospital.urgentNeeds.length > 0 && (
                      <div className="urgent-needs">
                        <strong>Kebutuhan Mendesak</strong>
                        <div className="urgent-blood-types">
                          {hospital.urgentNeeds.map((type) => (
                            <span key={type} className="urgent-blood-badge">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="hospital-card-actions">
                      <Link
                        to={`/stok-darah/${hospital.id}`}
                        className="detail-button"
                      >
                        Lihat Detail Stok <FaChevronRight />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#666",
                      margin: 0,
                    }}
                  >
                    Tidak ada rumah sakit yang sesuai dengan filter yang dipilih.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}