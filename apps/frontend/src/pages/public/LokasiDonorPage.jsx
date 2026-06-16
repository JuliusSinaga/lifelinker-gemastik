import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/LokasiDonorPage.css";
import Header from "../../components/Header";
import GoogleMapComponent from "../../components/GoogleMapComponent";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";
import Badge from "../../components/core/Badge";

export default function LokasiDonorPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. STATE UNTUK FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Semua Kota/Kabupaten");

  // Cek Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Lokasi
        const locRes = await axiosClient.get("/lokasi");
        const dataDB = locRes.data.data || [];

        // Fetch Stok Darah (untuk melihat mana yang Kritis)
        const stokRes = await axiosClient.get("/stok-darah");
        const stokDB = stokRes.data.data || [];
        
        // Cari golongan darah apa saja yang "Kritis"
        const kritisBloodTypes = stokDB
          .filter(s => s.ketersediaan === "Kritis")
          .map(s => `${s.gol_darah}${s.rhesus}`);
          
        const hasUrgent = kritisBloodTypes.length > 0;
        const urgentString = kritisBloodTypes.join(" ");

        const mappedLocations = dataDB.map((item, index) => {
          // Logika sederhana menentukan kota berdasarkan string alamat
          const city = item.alamat_lokasi.includes("Balige")
            ? "Balige"
            : "Medan";

          return {
            id: item.ID,
            name: item.nama_lokasi,
            address: item.alamat_lokasi,
            city: city,
            image: item.gambar_lokasi || "/images/bg beranda awal.jpg",

            // Data aktual vs Dummy
            rating: (4 + Math.random()).toFixed(1),
            distance: `${(2 + index * 1.5).toFixed(1)} km`,
            donors: item.jumlah_pendaftar || 0,
            urgent: hasUrgent,
            blood: hasUrgent ? urgentString : "",
            lat: item.latitude || (3.5186 + index * 0.02),
            lng: item.longitude || (98.6053 + index * 0.02),
          };
        });

        setLocations(mappedLocations);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. LOGIKA FILTERING ---
  // Filter dijalankan setiap kali locations, searchTerm, atau selectedCity berubah
  const filteredLocations = locations.filter((loc) => {
    // 1. Filter Nama (Case insensitive)
    const matchName = loc.name.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filter Kota
    const matchCity =
      selectedCity === "Semua Kota/Kabupaten" || loc.city === selectedCity;

    return matchName && matchCity;
  });

  return (
    <div className="lokasid-root">
      <Header showUserProfile={isLoggedIn} />

      {/* Hero Section */}
      <section className="lokasi-hero" style={{ backgroundColor: 'var(--color-brand-primary)', padding: '60px 5% 80px', textAlign: 'center' }}>
        <div className="lokasi-hero-content">
          <h1 style={{ fontFamily: 'var(--font-family-brand)', color: 'white', fontSize: '36px', marginBottom: '16px' }}>
            Temukan Lokasi <span style={{ fontWeight: 800 }}>Donor Darah</span>
          </h1>
          <p className="lokasi-sub" style={{ fontFamily: 'var(--font-family-primary)', color: 'white', opacity: 0.9, fontSize: '18px' }}>
            Cek ketersediaan stok darah dan jadwalkan donormu <br /> di rumah sakit atau PMI terdekat.
          </p>
        </div>
      </section>

      {/* --- 3. SEARCH SECTION (INPUT CONTROLLED) --- */}
      <section className="lokasi-search-section" style={{ maxWidth: '1000px', margin: '-40px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div className="lokasi-search-container">
          <Card variant="standard" className="lokasi-search-card" style={{ padding: '24px 32px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', boxShadow: 'var(--shadow-elevated)', justifyContent: 'space-between' }}>
            <div className="search-input-group" style={{ flex: '1', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Icon icon="mdi:magnify" className="search-icon" style={{ position: "absolute", left: "16px", color: "var(--color-text-secondary)" }} />
              <Input
                type="text"
                placeholder="Cari nama rumah sakit atau PMI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: "44px" }}
              />
            </div>
            <div className="search-select-group" style={{ width: '250px' }}>
              <select
                className="lokasi-search-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-standard)', border: '1px solid var(--color-border-input)', backgroundColor: 'var(--color-surface-card)', color: 'var(--color-text-primary)' }}
              >
                <option value="Semua Kota/Kabupaten">Semua Kota/Kabupaten</option>
                <option value="Medan">Medan</option>
                <option value="Balige">Balige</option>
              </select>
            </div>
            <Button variant="primary" className="search-btn" style={{ whiteSpace: 'nowrap', padding: '12px 32px' }}>Cari Lokasi</Button>
          </Card>
        </div>
      </section>

      <main className="lokasi-main" style={{ backgroundColor: 'var(--color-bg-page)', padding: '40px 20px' }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", fontFamily: 'var(--font-family-primary)', color: 'var(--color-text-secondary)' }}>
            Memuat Lokasi...
          </div>
        ) : (
          <>
            {/* --- 4. TAMPILAN JIKA DATA DITEMUKAN --- */}
            {filteredLocations.length > 0 ? (
              <>
                {/* Peta Sebaran (Hanya menampilkan lokasi hasil filter) */}
                <div className="lokasi-list" style={{ marginBottom: "40px", maxWidth: '1200px', margin: '0 auto 40px' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-family-brand)',
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      marginBottom: "15px",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Peta Sebaran Lokasi
                  </h2>
                  <GoogleMapComponent locations={filteredLocations} />
                </div>

                {/* List Card Lokasi */}
                <div className="lokasi-list" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {filteredLocations.map((loc) => (
                    <Card key={loc.id} variant="standard" className="lokasi-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div className="lokasi-card-img" style={{ height: '200px' }}>
                        <img
                          src={process.env.PUBLIC_URL + loc.image}
                          alt={loc.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/bg beranda awal.jpg";
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="lokasi-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div className="lokasi-card-header" style={{ marginBottom: '16px' }}>
                          <Badge variant="primary" style={{ marginBottom: '12px' }}>{loc.city}</Badge>
                          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-family-primary)', fontSize: '20px' }}>{loc.name}</h3>
                          <div className="lokasi-address" style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{loc.address}</div>
                        </div>

                        {loc.urgent && (
                          <div className="urgent-container" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', padding: '12px', borderRadius: 'var(--radius-standard)', border: '1px dashed var(--color-status-error)', marginBottom: '16px' }}>
                            <div className="urgent-box-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: 'var(--color-status-error)', fontSize: '14px' }}>Kebutuhan Mendesak</strong>
                              <div className="urgent-blood" style={{ fontWeight: 'bold', color: 'var(--color-status-error)' }}>{loc.blood}</div>
                            </div>
                          </div>
                        )}

                        <div className="lokasi-card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            <span className="meta-star" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon icon="mdi:star" className="meta-icon" style={{ color: '#F59E0B' }} /> {loc.rating}
                            </span>
                            <span className="meta-distance" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon icon="mdi:map-marker" className="meta-icon" style={{ color: 'var(--color-brand-primary)' }} />{" "}
                              {loc.distance}
                            </span>
                            <span className="meta-donors" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon icon="mdi:account-group" className="meta-icon" style={{ color: 'var(--color-brand-primary)' }} /> {loc.donors}{" "}
                              Pendonor
                            </span>
                        </div>
                        
                        <div style={{ marginTop: 'auto' }}>
                          <Button as={Link} to={`/lokasi-donor/${loc.id}`} variant="ghost" fullWidth style={{ justifyContent: 'space-between' }}>
                            Lihat Detail Lokasi <Icon icon="mdi:chevron-right" width="20" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              /* --- 5. TAMPILAN JIKA TIDAK ADA HASIL --- */
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  width: "100%",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    color: "var(--color-border-input)",
                    marginBottom: "15px",
                  }}
                >
                  <Icon icon="mdi:magnify" width="60" />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-family-brand)',
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Lokasi Tidak Ditemukan
                </h3>
                <p style={{ fontFamily: 'var(--font-family-primary)' }}>Coba gunakan kata kunci lain atau ubah filter kota.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
