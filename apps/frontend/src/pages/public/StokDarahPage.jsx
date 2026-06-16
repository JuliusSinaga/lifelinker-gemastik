import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/StokDarahPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Badge from "../../components/core/Badge";

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
      <section className="stok-hero" style={{ backgroundColor: 'var(--color-brand-primary)', padding: '60px 5% 80px', textAlign: 'center' }}>
        <div className="stok-hero-content">
          <h1 style={{ fontFamily: 'var(--font-family-brand)', color: 'white', fontSize: '36px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '36px' }}>🩸</span> Stok Darah Rumah Sakit
          </h1>
          <p style={{ fontFamily: 'var(--font-family-primary)', color: 'white', opacity: 0.9, fontSize: '18px' }}>Cek ketersediaan stok darah di rumah sakit dan PMI terdekat</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="stok-main" style={{ backgroundColor: 'var(--color-bg-page)', paddingBottom: '60px' }}>
        {/* Filter Section (Floating) */}
        <div className="filter-section" style={{ maxWidth: '1000px', margin: '-40px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div className="filter-container">
            <Card variant="standard" className="filter-card" style={{ padding: '24px 32px', display: 'flex', gap: '32px', alignItems: 'center', boxShadow: 'var(--shadow-elevated)', justifyContent: 'center' }}>
              <div className="filter-item" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <Icon icon="mdi:filter" className="filter-icon" /> Filter Kota:
                </span>
                <select
                  className="filter-dropdown"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-standard)', border: '1px solid var(--color-border-input)', backgroundColor: 'var(--color-surface-card)' }}
                >
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <Icon icon="mdi:blood-bag" className="filter-icon" /> Golongan Darah:
                </span>
                <select
                  className="filter-dropdown"
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-standard)', border: '1px solid var(--color-border-input)', backgroundColor: 'var(--color-surface-card)' }}
                >
                  {bloodTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", fontFamily: 'var(--font-family-primary)', color: 'var(--color-text-secondary)' }}>Memuat Stok Darah...</div>
        ) : (
          <div className="stok-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {/* Results Info */}
            <div
              style={{
                marginBottom: "20px",
                color: "var(--color-text-secondary)",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Menampilkan {filteredHospitals.length} rumah sakit
            </div>

            {/* Hospital Cards */}
            <div className="hospitals-grid" style={{ display: 'grid', gap: '24px' }}>
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hospital) => (
                  <Card key={hospital.id} variant="standard" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="hospital-card-header">
                      <div className="hospital-basic-info">
                        <Badge variant="primary" style={{ marginBottom: '12px' }}>{hospital.city}</Badge>
                        <h3 style={{ margin: '0 0 12px 0', fontFamily: 'var(--font-family-primary)' }}>{hospital.name}</h3>
                        <div className="hospital-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                          <div className="meta-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <Icon icon="mdi:map-marker" className="meta-icon" width="18" style={{ marginTop: '2px', color: 'var(--color-brand-primary)' }} />
                            <span>{hospital.address}</span>
                          </div>
                          <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon icon="mdi:clock-outline" className="meta-icon" width="18" style={{ color: 'var(--color-brand-primary)' }} />
                            <span>{hospital.operationalHours}</span>
                          </div>
                          <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon icon="mdi:pin" className="meta-icon" width="18" style={{ color: 'var(--color-brand-primary)' }} />
                            <span>{hospital.distance}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blood Stock Summary */}
                    <div className="blood-stock-summary">
                      <h4 style={{ margin: '0 0 12px 0' }}>Status Stok Darah:</h4>
                      <div className="blood-types-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                        {hospital.bloodStock && Object.entries(hospital.bloodStock).map(
                          ([type, data]) => (
                            <div
                              key={type}
                              className={`blood-type-badge ${data.statusClass}`}
                              style={{ 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', 
                                borderRadius: 'var(--radius-standard)', border: '1px solid var(--color-border-input)',
                                backgroundColor: data.statusClass === 'critical' ? 'rgba(220, 38, 38, 0.1)' : data.statusClass === 'safe' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-background)'
                              }}
                            >
                              <span className="blood-type" style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-brand-primary)' }}>{type}</span>
                              <span className="blood-units" style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                                {data.units} Kantong
                              </span>
                              <span className="blood-status" style={{ fontSize: '12px', color: data.statusClass === 'critical' ? 'var(--color-status-error)' : data.statusClass === 'safe' ? 'var(--color-status-success)' : 'var(--color-text-secondary)' }}>{data.status}</span>
                            </div>
                          )
                        )}
                        {(!hospital.bloodStock || Object.keys(hospital.bloodStock).length === 0) && (
                            <p style={{fontSize:'12px', color:'var(--color-text-secondary)'}}>Data stok belum tersedia.</p>
                        )}
                      </div>
                    </div>

                    {/* Urgent Needs */}
                    {hospital.urgentNeeds && hospital.urgentNeeds.length > 0 && (
                      <div className="urgent-needs" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', padding: '16px', borderRadius: 'var(--radius-standard)', border: '1px dashed var(--color-status-error)' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--color-status-error)' }}>Kebutuhan Mendesak</strong>
                        <div className="urgent-blood-types" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {hospital.urgentNeeds.map((type) => (
                            <Badge key={type} variant="danger">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="hospital-card-actions" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-divider)' }}>
                      <Button as={Link} to={`/stok-darah/${hospital.id}`} variant="ghost" fullWidth style={{ justifyContent: 'space-between' }}>
                        Lihat Detail Stok <Icon icon="mdi:chevron-right" width="20" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    background: "var(--color-surface-card)",
                    borderRadius: "var(--radius-large)",
                    boxShadow: "var(--shadow-base)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "16px",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      fontWeight: "500",
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