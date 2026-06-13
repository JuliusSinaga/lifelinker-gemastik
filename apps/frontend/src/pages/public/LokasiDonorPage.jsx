import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/LokasiDonorPage.css";
import {
  FaStar,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch, // Tambahkan icon search untuk UI kosong
} from "react-icons/fa";
import Header from "../../components/Header";
import GoogleMapComponent from "../../components/GoogleMapComponent";
import axiosClient from "../../service/axiosClient";

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
    const fetchLocations = async () => {
      try {
        const response = await axiosClient.get("/lokasi");
        const dataDB = response.data.data || [];

        const mappedLocations = dataDB.map((item, index) => {
          const isUrgent = index % 2 === 0;
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

            // Dummy Data
            rating: (4 + Math.random()).toFixed(1),
            distance: `${(2 + index * 1.5).toFixed(1)} km`,
            donors: 100 + index * 25,
            urgent: isUrgent,
            blood: isUrgent ? (index % 3 === 0 ? "A+ O+" : "B+") : "",
            lat: 3.5186 + index * 0.02,
            lng: 98.6053 + index * 0.02,
          };
        });

        setLocations(mappedLocations);
      } catch (error) {
        console.error("Gagal mengambil data lokasi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
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
      <section
        className="lokasi-hero"
        style={{
          backgroundImage: `url(${encodeURI(
            process.env.PUBLIC_URL + "/images/bg beranda awal.jpg"
          )})`,
        }}
      >
        <div className="lokasi-hero-overlay">
          <div className="lokasi-hero-inner">
            <h1>
              Temukan Lokasi <span className="accent">Donor Darah</span>
            </h1>
            <p className="lokasi-sub">
              Cek ketersediaan stok darah dan jadwalkan donormu <br /> di rumah
              sakit atau PMI terdekat.
            </p>
          </div>
        </div>
      </section>

      {/* --- 3. SEARCH SECTION (INPUT CONTROLLED) --- */}
      <section className="lokasi-search-section">
        <div className="lokasi-search-container">
          <div className="lokasi-search-card">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Cari nama rumah sakit atau PMI..."
                className="lokasi-search-input"
                // Binding Value ke State
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-select-group">
              <select
                className="lokasi-search-select"
                // Binding Value ke State
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="Semua Kota/Kabupaten">
                  Semua Kota/Kabupaten
                </option>
                <option value="Medan">Medan</option>
                <option value="Balige">Balige</option>
              </select>
            </div>
            {/* Tombol Cari (Opsional karena sudah realtime, tapi dibiarkan untuk UX) */}
            <button className="search-btn">Cari Lokasi</button>
          </div>
        </div>
      </section>

      <main className="lokasi-main">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            Memuat Lokasi...
          </div>
        ) : (
          <>
            {/* --- 4. TAMPILAN JIKA DATA DITEMUKAN --- */}
            {filteredLocations.length > 0 ? (
              <>
                {/* Peta Sebaran (Hanya menampilkan lokasi hasil filter) */}
                <div className="lokasi-list" style={{ marginBottom: "40px" }}>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      marginBottom: "15px",
                      color: "#333",
                    }}
                  >
                    Peta Sebaran Lokasi
                  </h2>
                  <GoogleMapComponent locations={filteredLocations} />
                </div>

                {/* List Card Lokasi */}
                <div className="lokasi-list">
                  {filteredLocations.map((loc) => (
                    <article className="lokasi-card" key={loc.id}>
                      <div className="lokasi-card-img">
                        <img
                          src={process.env.PUBLIC_URL + loc.image}
                          alt={loc.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/bg beranda awal.jpg";
                          }}
                        />
                      </div>
                      <div className="lokasi-card-body">
                        <div className="lokasi-card-header">
                          <span className="lokasi-tag">{loc.city}</span>
                          <h3>{loc.name}</h3>
                          <div className="lokasi-address">{loc.address}</div>
                        </div>

                        {loc.urgent && (
                          <div className="urgent-container">
                            <div className="urgent-box-top">
                              <strong>Kebutuhan Mendesak</strong>
                              <div className="urgent-blood">{loc.blood}</div>
                            </div>
                          </div>
                        )}

                        <div className="lokasi-card-meta">
                          <div className="meta-left">
                            <span className="meta-star">
                              <FaStar className="meta-icon" /> {loc.rating}
                            </span>
                            <span className="meta-distance">
                              <FaMapMarkerAlt className="meta-icon" />{" "}
                              {loc.distance}
                            </span>
                            <span className="meta-donors">
                              <FaUsers className="meta-icon" /> {loc.donors}{" "}
                              Pendonor
                            </span>
                          </div>
                          <div className="meta-right">
                            <Link
                              to={`/lokasi-donor/${loc.id}`}
                              className="lokasi-detail-link"
                            >
                              Lihat Detail Lokasi →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
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
                  color: "#666",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    color: "#ccc",
                    marginBottom: "15px",
                  }}
                >
                  <FaSearch />
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#444",
                  }}
                >
                  Lokasi Tidak Ditemukan
                </h3>
                <p>Coba gunakan kata kunci lain atau ubah filter kota.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
