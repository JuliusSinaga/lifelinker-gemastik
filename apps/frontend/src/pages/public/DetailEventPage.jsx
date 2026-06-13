import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../../styles/DetailEventPage.css";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaArrowLeft,
  FaStar,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

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
          id: dataDB.ID,
          title: dataDB.nama_event,
          description: dataDB.deskripsi_event,
          date: formatDate(dataDB.tanggal_event),
          time: "08:00 - 14:00 WIB",
          location: dataDB.lokasi?.nama_lokasi || "Lokasi belum ditentukan",
          address: dataDB.lokasi?.alamat_lokasi || "Alamat belum tersedia",
          image: dataDB.gambar_event || "bg beranda awal.jpg",
          targetDate: new Date(dataDB.tanggal_event),

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
      <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
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
        <button onClick={() => navigate("/event")}>Kembali</button>
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
            process.env.PUBLIC_URL + "/images/" + event.image
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content-detail">
            <Link to="/event" className="back-link">
              <FaArrowLeft /> Kembali ke Event
            </Link>
            <h1>{event.title}</h1>

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
      <main className="event-detail-main">
        <div className="event-detail-container">
          <div className="event-detail-grid">
            {/* Left Column */}
            <div className="event-info-column">
              <div className="event-description-card">
                <h2>Deskripsi Event</h2>
                <p>{event.description}</p>
              </div>

              <div className="event-info-card">
                <h3>Informasi Penting</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <div className="info-label">Tanggal</div>
                      <div className="info-value">{event.date}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaClock className="info-icon" />
                    <div>
                      <div className="info-label">Waktu</div>
                      <div className="info-value">{event.time}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <div>
                      <div className="info-label">Lokasi</div>
                      <div className="info-value">{event.location}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaUsers className="info-icon" />
                    <div>
                      <div className="info-label">Peserta</div>
                      <div className="info-value">Umum</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="timeline-card">
                <h3>Timeline Acara</h3>
                <div className="timeline-list">
                  {event.timeline.map((item, index) => (
                    <div key={index} className={`timeline-item ${item.status}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-time">{item.time}</div>
                        <div className="timeline-activity">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="testimonials-card">
                <h3>Apa Kata Mereka?</h3>
                <div className="testimonials-list">
                  {event.testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-item">
                      <div className="testimonial-header">
                        <div className="testimonial-info">
                          <div className="testimonial-name">
                            {testimonial.name}
                          </div>
                          <div className="testimonial-rating">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="testimonial-comment">
                        "{testimonial.comment}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Registration */}
            <div className="registration-column">
              {/* Registration Status (AUTO UPDATE) */}
              <div className="registration-status-card">
                <h3>Status Pendaftaran</h3>
                <div className="quota-info">
                  <div className="quota-label">Kuota Terisi</div>
                  <div className="quota-progress-row">
                    <div className="quota-bar">
                      <div
                        className="quota-fill"
                        style={{
                          width: `${
                            (event.quota.current / event.quota.total) * 100
                          }%`,
                          backgroundColor:
                            event.quota.current >= event.quota.total
                              ? "#e74c3c"
                              : "#d92b2b",
                        }}
                      ></div>
                    </div>
                    <div className="quota-numbers">
                      {event.quota.current} / {event.quota.total}
                    </div>
                  </div>
                  {event.quota.current >= event.quota.total && (
                    <p
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.9rem",
                        marginTop: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Kuota Penuh!
                    </p>
                  )}
                </div>
              </div>

              {/* Registration Form */}
              <div className="registration-form-card">
                <h3>Daftar Event</h3>
                <form onSubmit={handleSubmit} className="registration-form">
                  <div className="form-group">
                    <label htmlFor="nama">Nama Lengkap</label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nomor">Nomor HP</label>
                    <input
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
                    <label htmlFor="golonganDarah">Golongan Darah</label>
                    <select
                      id="golonganDarah"
                      name="golonganDarah"
                      value={formData.golonganDarah}
                      onChange={handleInputChange}
                      required
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

                  <button
                    type="submit"
                    className="register-button"
                    disabled={
                      isSubmitting || event.quota.current >= event.quota.total
                    }
                    style={{
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
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
