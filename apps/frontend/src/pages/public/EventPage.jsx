import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/EventPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient"; 
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";

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
          id: event.id || event.ID,
          title: event.title || event.nama_event,
          date: formatDate(event.date || event.tanggal_event),
          rawDate: event.date || event.tanggal_event, // simpan raw untuk sorting jika perlu
          location: event.lokasi ? event.lokasi.nama_lokasi : "Lokasi Belum Ditentukan",
          image: event.image || event.gambar_event || "bg beranda awal.jpg",
          description: event.description || event.deskripsi_event
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
      <section className="event-hero" style={{ backgroundColor: 'var(--color-brand-primary)', padding: '60px 5% 80px', textAlign: 'center' }}>
        <div className="event-hero-content">
          <h1 style={{ fontFamily: 'var(--font-family-brand)', color: 'white', fontSize: '36px', marginBottom: '16px' }}>
            <Icon icon="mdi:calendar-check" width="40" style={{ marginRight: "10px", verticalAlign: 'middle' }} />
            Event Donor Darah
          </h1>
          <p style={{ fontFamily: 'var(--font-family-primary)', color: 'white', opacity: 0.9, fontSize: '18px' }}>
            Ikuti berbagai kegiatan donor darah dan aksi sosial di sekitar Anda
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="event-main" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        {loading ? (
          <div style={{textAlign: "center", padding: "50px", fontFamily: 'var(--font-family-primary)', color: 'var(--color-text-secondary)'}}>Memuat Event...</div>
        ) : (
          <div className="event-container">
            
            {/* Featured Event Section */}
            {featuredEvent && (
              <section className="featured-event-section">
                <h2 style={{ fontFamily: 'var(--font-family-brand)' }}>
                  Event <span className="highlight" style={{ color: 'var(--color-brand-primary)' }}>Unggulan</span>
                </h2>

                <Card variant="standard" className="featured-event-card" style={{ display: 'flex', overflow: 'hidden', padding: 0 }}>
                  <div className="featured-event-image" style={{ flex: 1 }}>
                    <img
                      src={process.env.PUBLIC_URL + `/images/${featuredEvent.image.replace("/images/", "")}`}
                      alt={featuredEvent.title}
                      onError={(e) => {e.target.onerror = null; e.target.src="/images/bg beranda awal.jpg"}}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="featured-event-content" style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: 'var(--font-family-primary)', margin: '0 0 16px 0' }}>{featuredEvent.title}</h3>
                    {featuredEvent.description && (
                      <p style={{marginBottom: '24px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{featuredEvent.description}</p>
                    )}

                    <div className="event-details" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                      <div className="event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon icon="mdi:calendar-blank" width="20" style={{ color: 'var(--color-brand-primary)' }} />
                        <span>
                          <strong>Tanggal:</strong> {featuredEvent.date}
                        </span>
                      </div>
                      <div className="event-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon icon="mdi:map-marker" width="20" style={{ color: 'var(--color-brand-primary)' }} />
                        <span>
                          <strong>Lokasi:</strong> {featuredEvent.location}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <Button as={Link} to={`/event/${featuredEvent.id}`} variant="primary">
                        Lihat Detail & Daftar <Icon icon="mdi:chevron-right" width="20" style={{ marginLeft: '8px' }} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Upcoming Events Section */}
            <section className="upcoming-events-section" style={{ marginTop: '64px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-family-brand)', margin: 0 }}>
                  Semua Event <span className="highlight" style={{ color: 'var(--color-brand-primary)' }}>Mendatang</span>
                </h2>

                {/* Filter */}
                <Card variant="standard" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-base)' }}>
                  <Icon icon="mdi:filter" width="20" style={{ color: 'var(--color-text-primary)' }} />
                  <span style={{ fontWeight: 'bold' }}>Filter Lokasi:</span>
                  <select
                    className="filter-dropdown"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-standard)', border: '1px solid var(--color-border-input)', backgroundColor: 'var(--color-surface-card)', outline: 'none' }}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Card>
              </div>

              <div className="upcoming-events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Card key={event.id} variant="standard" className="upcoming-event-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div className="upcoming-event-image" style={{ height: '200px' }}>
                        <img
                          src={process.env.PUBLIC_URL + `/images/${event.image.replace("/images/", "")}`}
                          alt={event.title}
                          onError={(e) => {e.target.onerror = null; e.target.src="/images/bg beranda awal.jpg"}}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="upcoming-event-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h4 style={{ fontFamily: 'var(--font-family-primary)', margin: '0 0 16px 0', fontSize: '18px' }}>{event.title}</h4>
                        <div className="event-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
                          <div className="event-detail-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            <Icon icon="mdi:calendar-blank" width="18" style={{ marginTop: '2px', color: 'var(--color-brand-primary)' }} />
                            <span>
                              <strong>Tanggal:</strong> {event.date}
                            </span>
                          </div>
                          <div className="event-detail-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                            <Icon icon="mdi:map-marker" width="18" style={{ marginTop: '2px', color: 'var(--color-brand-primary)' }} />
                            <span>
                              <strong>Lokasi:</strong> {event.location}
                            </span>
                          </div>
                        </div>
                        <Button as={Link} to={`/event/${event.id}`} variant="ghost" fullWidth style={{ justifyContent: 'space-between' }}>
                          Lihat Detail <Icon icon="mdi:chevron-right" width="20" />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p style={{fontStyle: 'italic', color: 'var(--color-text-secondary)', gridColumn: '1 / -1'}}>
                    {featuredEvent ? "Tidak ada event mendatang lainnya." : "Tidak ada event yang ditemukan."}
                  </p>
                )}
              </div>
            </section>

            {/* Participation Stats Section (Static for now) */}
            <section className="participation-section" style={{ marginTop: '64px', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-family-brand)' }}>
                Partisipasi <span className="highlight" style={{ color: 'var(--color-brand-primary)' }}>Komunitas</span>
              </h2>

              <div className="participation-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <Card variant="standard" className="total-participants" style={{ backgroundColor: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', gap: '24px', padding: '32px' }}>
                  <div className="participants-icon" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '24px', borderRadius: '50%' }}>
                    <Icon icon="mdi:account-group" width="48" style={{ color: 'white' }} />
                  </div>
                  <div className="participants-info">
                    <div className="participants-number" style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-family-brand)', color: 'white' }}>
                      {participationStats.totalParticipants}
                    </div>
                    <div className="participants-label" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                      Total Pendaftar Bulan Ini
                    </div>
                  </div>
                </Card>

                <Card variant="standard" className="participation-by-city" style={{ padding: '32px' }}>
                  <h3 style={{ margin: '0 0 24px 0', fontFamily: 'var(--font-family-primary)' }}>Pendaftar Per Kota</h3>
                  <div className="city-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {participationStats.cities.map((city) => (
                      <div key={city.name} className="city-stat-item" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="city-name" style={{ width: '80px', fontWeight: 'bold' }}>{city.name}</div>
                        <div className="city-progress" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="progress-bar-container" style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-border-divider)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${(city.participants / 550) * 100}%`,
                                height: '100%',
                                backgroundColor: 'var(--color-brand-primary)'
                              }}
                            ></div>
                          </div>
                          <div className="city-count" style={{ width: '40px', textAlign: 'right', fontWeight: 'bold' }}>{city.participants}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}