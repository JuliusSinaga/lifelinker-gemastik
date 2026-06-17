import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../../styles/DetailEventPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

export default function DetailEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // State Form Pendaftaran
  const [formData, setFormData] = useState({
    nama: "",
    nomor: "", // Digunakan untuk Nomor HP
    golonganDarah: "", // Tambahan field agar sesuai konteks donor
  });

  // 1. Fetch Detail Event
  useEffect(() => {
    const fetchDetailEvent = async () => {
      try {
        const response = await axiosClient.get(`/events/${id}`);
        const dataDB = response.data.data;

        // --- HITUNG KUOTA DARI DB ---
        // Asumsi DB punya field 'Participants' (array) dan 'target_peserta' (int)
        const currentParticipants = dataDB.Participants
          ? dataDB.Participants.length
          : dataDB.jumlah_peserta || 0;
        const totalQuota = dataDB.target_peserta || 300;

        const eventData = {
          id: dataDB.id || dataDB.ID,
          title: dataDB.title || dataDB.nama_event,
          description: dataDB.description || dataDB.deskripsi_event,
          date: formatDate(dataDB.date || dataDB.tanggal_event),
          time: "08:00 - 14:00 WIB",
          location: dataDB.lokasi?.nama_lokasi || "Lokasi belum ditentukan",
          address: dataDB.lokasi?.alamat_lokasi || "Alamat belum tersedia",
          image: dataDB.image || dataDB.gambar_event || "bg beranda awal.jpg",
          targetDate: new Date(dataDB.date || dataDB.tanggal_event),

          quota: {
            current: currentParticipants,
            total: totalQuota,
          },

          // Data Pelengkap (Dummy)
          timeline: [
            {
              time: "08:00 - 10:00",
              activity: "Registrasi & Cek Kesehatan",
              status: "active",
            },
            {
              time: "10:00 - 14:00",
              activity: "Proses Donor Darah",
              status: "upcoming",
            },
          ],
          testimonials: [
            {
              name: "Peserta 1",
              rating: 5,
              comment: "Acara sangat bermanfaat!",
            },
            { name: "Peserta 2", rating: 4, comment: "Antrian tertib." },
          ],
        };

        setEvent(eventData);
      } catch (error) {
        console.error("Gagal mengambil detail event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailEvent();
  }, [id]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!event) return;
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = event.targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [event]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cek Kuota Penuh
    if (event.quota.current >= event.quota.total) {
      alert("Maaf, kuota event ini sudah penuh.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulasi Request ke Backend (Ganti URL dengan endpoint asli Anda)
      // await axiosClient.post(`/events/${id}/register`, formData);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulasi Delay

      // --- UPDATE KUOTA REAL-TIME ---
      setEvent((prev) => ({
        ...prev,
        quota: {
          ...prev.quota,
          current: prev.quota.current + 1, // Tambah 1 peserta
        },
      }));

      setFormData({ nama: "", nomor: "", golonganDarah: "" });
      alert("Pendaftaran Event Berhasil!");
    } catch (error) {
      console.error("Gagal mendaftar:", error);
      alert("Terjadi kesalahan saat mendaftar event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Functions
  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Icon key={i} icon={i < rating ? "mdi:star" : "mdi:star-outline"} style={{ color: i < rating ? "#F59E0B" : "var(--color-border-input)" }} />
    ));

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading)
    return (
      <div
        className="detail-event-root"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Memuat detail event...</p>
      </div>
    );
  if (!event)
    return (
      <div
        className="detail-event-root"
        style={{ textAlign: "center", padding: "50px" }}
      >
        <h2>Event tidak ditemukan.</h2>
        <Button onClick={() => navigate("/event")} variant="primary">Kembali</Button>
      </div>
    );

  return (
    <div className="detail-event-root">
      <Header />

      {/* Hero Section */}
      <section
        className="event-hero-detail"
        style={{
          backgroundImage: `url(${
            process.env.PUBLIC_URL + "/images/" + event.image.replace("/images/", "")
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content-detail">
            <Button
              as={Link}
              to="/event"
              variant="ghost"
              className="back-link"
              style={{ paddingLeft: 0, color: "white", marginBottom: "16px" }}
            >
              <Icon icon="mdi:arrow-left" width="20" style={{ marginRight: "8px" }} /> Kembali ke Event
            </Button>
            <h1 style={{ fontFamily: "var(--font-family-brand)" }}>{event.title}</h1>

            {/* Countdown */}
            <div className="countdown-timer">
              <div className="countdown-item">
                <div className="countdown-number">{timeLeft.days}</div>
                <div className="countdown-label">Hari</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-number">{timeLeft.hours}</div>
                <div className="countdown-label">Jam</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-number">{timeLeft.minutes}</div>
                <div className="countdown-label">Menit</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-number">{timeLeft.seconds}</div>
                <div className="countdown-label">Detik</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="event-detail-main" style={{ backgroundColor: "var(--color-bg-page)" }}>
        <div className="event-detail-container">
          <div className="event-detail-grid">
            {/* Left Column */}
            <div className="event-info-column">
              <Card variant="standard" className="event-description-card" style={{ padding: "32px", marginBottom: "24px" }}>
                <h2 style={{ margin: "0 0 16px 0", fontFamily: "var(--font-family-brand)" }}>Deskripsi Event</h2>
                <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{event.description}</p>
              </Card>

              <Card variant="standard" className="event-info-card" style={{ padding: "32px", marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 24px 0" }}>Informasi Penting</h3>
                <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div className="info-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Icon icon="mdi:calendar" className="info-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                    <div>
                      <div className="info-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "4px" }}>Tanggal</div>
                      <div className="info-value" style={{ fontWeight: "bold" }}>{event.date}</div>
                    </div>
                  </div>
                  <div className="info-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Icon icon="mdi:clock-outline" className="info-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                    <div>
                      <div className="info-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "4px" }}>Waktu</div>
                      <div className="info-value" style={{ fontWeight: "bold" }}>{event.time}</div>
                    </div>
                  </div>
                  <div className="info-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Icon icon="mdi:map-marker" className="info-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                    <div>
                      <div className="info-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "4px" }}>Lokasi</div>
                      <div className="info-value" style={{ fontWeight: "bold" }}>{event.location}</div>
                    </div>
                  </div>
                  <div className="info-item" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Icon icon="mdi:account-group" className="info-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                    <div>
                      <div className="info-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "4px" }}>Peserta</div>
                      <div className="info-value" style={{ fontWeight: "bold" }}>Umum</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="standard" className="timeline-card" style={{ padding: "32px", marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 24px 0" }}>Timeline Acara</h3>
                <div className="timeline-list">
                  {event.timeline.map((item, index) => (
                    <div key={index} className={`timeline-item ${item.status}`} style={{ display: "flex", gap: "16px", marginBottom: index !== event.timeline.length - 1 ? "24px" : "0", position: "relative" }}>
                      {/* Timeline Line */}
                      {index !== event.timeline.length - 1 && <div style={{ position: "absolute", left: "7px", top: "24px", bottom: "-24px", width: "2px", backgroundColor: "var(--color-border-divider)" }}></div>}
                      
                      <div className="timeline-marker" style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: item.status === "active" ? "var(--color-brand-primary)" : "var(--color-border-input)", marginTop: "4px", zIndex: 1 }}></div>
                      <div className="timeline-content">
                        <div className="timeline-time" style={{ fontWeight: "bold", marginBottom: "4px", color: item.status === "active" ? "var(--color-brand-primary)" : "var(--color-text-secondary)" }}>{item.time}</div>
                        <div className="timeline-activity">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="standard" className="testimonials-card" style={{ padding: "32px", marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 24px 0" }}>Apa Kata Mereka?</h3>
                <div className="testimonials-list" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {event.testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-item" style={{ padding: "20px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
                      <div className="testimonial-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div className="testimonial-info">
                          <div className="testimonial-name" style={{ fontWeight: "bold" }}>
                            {testimonial.name}
                          </div>
                          <div className="testimonial-rating" style={{ display: "flex", gap: "2px" }}>
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="testimonial-comment" style={{ fontStyle: "italic", color: "var(--color-text-secondary)" }}>
                        "{testimonial.comment}"
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Registration */}
            <div className="registration-column">
              {/* Registration Status (AUTO UPDATE) */}
              <Card variant="standard" className="registration-status-card" style={{ padding: "24px", marginBottom: "24px", backgroundColor: "var(--color-brand-primary)", color: "white" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "white" }}>Status Pendaftaran</h3>
                <div className="quota-info">
                  <div className="quota-label" style={{ marginBottom: "8px", fontWeight: "bold" }}>Kuota Terisi</div>
                  <div className="quota-progress-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="quota-bar" style={{ flex: 1, height: "8px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        className="quota-fill"
                        style={{
                          height: "100%",
                          width: `${
                            (event.quota.current / event.quota.total) * 100
                          }%`,
                          backgroundColor:
                            event.quota.current >= event.quota.total
                              ? "#ef4444"
                              : "white",
                        }}
                      ></div>
                    </div>
                    <div className="quota-numbers" style={{ fontWeight: "bold" }}>
                      {event.quota.current} / {event.quota.total}
                    </div>
                  </div>
                  {event.quota.current >= event.quota.total && (
                    <p
                      style={{
                        color: "#fca5a5",
                        fontSize: "0.9rem",
                        marginTop: "8px",
                        marginBottom: 0,
                        fontWeight: "bold",
                        textAlign: "center"
                      }}
                    >
                      Kuota Penuh!
                    </p>
                  )}
                </div>
              </Card>

              {/* Registration Form */}
              <Card variant="standard" className="registration-form-card" style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 24px 0" }}>Daftar Event</h3>
                <form onSubmit={handleSubmit} className="registration-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label htmlFor="nama" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nama Lengkap</label>
                    <Input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nomor" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nomor HP</label>
                    <Input
                      type="tel"
                      id="nomor"
                      name="nomor"
                      value={formData.nomor}
                      onChange={handleInputChange}
                      required
                      placeholder="0812..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="golonganDarah" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Golongan Darah</label>
                    <select
                      id="golonganDarah"
                      name="golonganDarah"
                      value={formData.golonganDarah}
                      onChange={handleInputChange}
                      required
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)" }}
                    >
                      <option value="">Pilih</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={
                      isSubmitting || event.quota.current >= event.quota.total
                    }
                    style={{
                      marginTop: "8px",
                      opacity:
                        isSubmitting || event.quota.current >= event.quota.total
                          ? 0.6
                          : 1,
                    }}
                  >
                    {isSubmitting
                      ? "Mendaftar..."
                      : event.quota.current >= event.quota.total
                      ? "Kuota Penuh"
                      : "Daftar Sekarang"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
