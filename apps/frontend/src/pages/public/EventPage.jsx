import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/EventPage.css";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChevronRight,
  FaUsers,
  FaFilter,
  FaCalendarCheck,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient"; // 1. Import axiosClient

// Data Dummy untuk Statistik Partisipasi (Belum ada endpoint khusus di backend)
const participationStats = {
  totalParticipants: "1.000+",
  cities: [
    { name: "Medan", participants: 550 },
    { name: "Siantar", participants: 400 },
    { name: "Laguboti", participants: 180 },
  ],
};

export default function EventPage() {
  const [selectedFilter, setSelectedFilter] = useState("Semua Lokasi");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const filterOptions = [
    "Semua Lokasi",
    "Medan",
    "Balige",
    "Siantar",
    "Laguboti",
  ];

  // 1. Cek Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 2. Fetch Data Events dari Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosClient.get("/events");
        const dataDB = response.data.data || [];
        
        // Mapping data DB ke format yang lebih mudah dipakai di UI
        const mappedEvents = dataDB.map(event => ({
          id: event.ID,
          title: event.nama_event,
          date: formatDate(event.tanggal_event),
          rawDate: event.tanggal_event, // simpan raw untuk sorting jika perlu
          location: event.lokasi ? event.lokasi.nama_lokasi : "Lokasi Belum Ditentukan",
          image: event.gambar_event || "bg beranda awal.jpg",
          description: event.deskripsi_event
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Filter Logic
  const filteredEvents = events.filter((event) => {
    if (selectedFilter === "Semua Lokasi") return true;
    return event.location.includes(selectedFilter);
  });

  // Pisahkan Featured (Index 0) dan Upcoming (Sisanya)
  const featuredEvent = filteredEvents.length > 0 ? filteredEvents[0] : null;
  const upcomingEvents = filteredEvents.length > 1 ? filteredEvents.slice(1) : [];

  return (
    <div className="event-page-root">
      <Header showUserProfile={isLoggedIn} />

      {/* Hero Section */}
      <section className="event-hero">
        <div className="event-hero-content">
          <h1>
            <FaCalendarCheck style={{ fontSize: "2rem", marginRight: "10px" }} />
            Event Donor Darah
          </h1>
          <p>
            Ikuti berbagai kegiatan donor darah dan aksi sosial di sekitar Anda
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="event-main">
        {loading ? (
          <div style={{textAlign: "center", padding: "50px"}}>Memuat Event...</div>
        ) : (
          <div className="event-container">
            
            {/* Featured Event Section */}
            {featuredEvent && (
              <section className="featured-event-section">
                <h2>
                  Event <span className="highlight">Unggulan</span>
                </h2>

                <div className="featured-event-card">
                  <div className="featured-event-image">
                    <img
                      src={process.env.PUBLIC_URL + `/images/${featuredEvent.image.replace("/images/", "")}`} // Handle path format
                      alt={featuredEvent.title}
                      onError={(e) => {e.target.onerror = null; e.target.src="/images/bg beranda awal.jpg"}}
                    />
                  </div>
                  <div className="featured-event-content">
                    <h3>{featuredEvent.title}</h3>
                    {featuredEvent.description && (
                      <p style={{marginBottom: '15px', color: '#555'}}>{featuredEvent.description}</p>
                    )}

                    <div className="event-details">
                      <div className="event-detail-item">
                        <FaCalendarAlt className="event-icon" />
                        <span>
                          <strong>Tanggal:</strong> {featuredEvent.date}
                        </span>
                      </div>
                      <div className="event-detail-item">
                        <FaMapMarkerAlt className="event-icon" />
                        <span>
                          <strong>Lokasi:</strong> {featuredEvent.location}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/event/${featuredEvent.id}`}
                      className="featured-event-button"
                    >
                      Lihat Detail & Daftar <FaChevronRight />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Upcoming Events Section */}
            <section className="upcoming-events-section">
              <h2>
                Semua Event <span className="highlight">Mendatang</span>
              </h2>

              {/* Filter */}
              <div className="events-filter">
                <div className="filter-item">
                  <FaFilter className="filter-icon" />
                  <span>Filter Lokasi:</span>
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
              </div>

              <div className="upcoming-events-grid">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="upcoming-event-card">
                      <div className="upcoming-event-image">
                        <img
                          src={process.env.PUBLIC_URL + `/images/${event.image.replace("/images/", "")}`}
                          alt={event.title}
                          onError={(e) => {e.target.onerror = null; e.target.src="/images/bg beranda awal.jpg"}}
                        />
                      </div>
                      <div className="upcoming-event-content">
                        <h4>{event.title}</h4>
                        <div className="event-details">
                          <div className="event-detail-item">
                            <FaCalendarAlt className="event-icon" />
                            <span>
                              <strong>Tanggal:</strong> {event.date}
                            </span>
                          </div>
                          <div className="event-detail-item">
                            <FaMapMarkerAlt className="event-icon" />
                            <span>
                              <strong>Lokasi:</strong> {event.location}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="upcoming-event-button"
                        >
                          Lihat Detail <FaChevronRight />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{fontStyle: 'italic', color: '#666'}}>
                    {featuredEvent ? "Tidak ada event mendatang lainnya." : "Tidak ada event yang ditemukan."}
                  </p>
                )}
              </div>
            </section>

            {/* Participation Stats Section (Static for now) */}
            <section className="participation-section">
              <h2>
                Partisipasi <span className="highlight">Komunitas</span>
              </h2>

              <div className="participation-content">
                <div className="total-participants">
                  <div className="participants-icon">
                    <FaUsers />
                  </div>
                  <div className="participants-info">
                    <div className="participants-number">
                      {participationStats.totalParticipants}
                    </div>
                    <div className="participants-label">
                      Total Pendaftar Bulan Ini
                    </div>
                  </div>
                </div>

                <div className="participation-by-city">
                  <h3>Pendaftar Per Kota</h3>
                  <div className="city-stats">
                    {participationStats.cities.map((city) => (
                      <div key={city.name} className="city-stat-item">
                        <div className="city-name">{city.name}</div>
                        <div className="city-progress">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${(city.participants / 550) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="city-count">{city.participants}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}