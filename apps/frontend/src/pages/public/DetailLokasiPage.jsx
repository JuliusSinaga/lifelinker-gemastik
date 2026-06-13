import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/DetailLokasiPage.css";
import {
  FaStar,
  FaPhone,
  FaClock,
  FaInfoCircle,
  FaComments,
  FaRoute,
  FaUsers,
  FaHeart,
  FaTrophy,
  FaBullhorn,
  FaArrowLeft,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

export default function DetailLokasiPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // [BARU] State User Login
  const [currentUser, setCurrentUser] = useState(null);

  // State Form Pendaftaran
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nomorHP: "",
    golonganDarah: "",
    tanggalDonor: "",
    pilihTanggal: "",
    pilihJam: "",
  });

  // State Form Review
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: "" });

  // 1. Fetch Data & Cek Login
  useEffect(() => {
    // Cek User Login
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setCurrentUser(userObj);
      
      // Auto-fill form jika user login
      setFormData(prev => ({
        ...prev,
        namaLengkap: userObj.name || userObj.Nama || "",
        nomorHP: userObj.phone || userObj.NoHp || "",
        golonganDarah: userObj.blood_type || userObj.GolDarah || ""
      }));
    }

    const fetchDetailLokasi = async () => {
      try {
        const response = await axiosClient.get(`/lokasi/${id}`);
        const dataDB = response.data.data;

        const mergedData = {
          id: dataDB.ID,
          name: dataDB.nama_lokasi,
          city: dataDB.alamat_lokasi.includes("Balige") ? "Balige" : "Medan",
          fullAddress: dataDB.alamat_lokasi,
          phone: dataDB.kontak_lokasi,
          operationalHours: dataDB.jam_operasional_lokasi,
          image: dataDB.gambar_lokasi || "/images/bg beranda awal.jpg",

          quotaUsed: dataDB.jumlah_pendaftar || 0,
          quotaTotal: dataDB.batas_kuota || 100,

          rating: 4.8,
          reviewCount: 120,
          event: {
            title: "Donor Darah Rutin",
            subtitle: "Mari donorkan darah Anda di lokasi ini.",
            date: "Setiap Hari Kerja",
          },
          bloodStock: {
            "A+": "Aman",
            "AB-": "Kurang",
            "B+": "Aman",
            "O+": "Kritis",
          },
          features: [
            {
              icon: "FaUsers",
              title: "Dibutuhkan",
              subtitle: "Golongan darah O+ sangat dibutuhkan.",
            },
            {
              icon: "FaHeart",
              title: "Pelayanan",
              subtitle: "Ramah dan profesional.",
            },
            {
              icon: "FaTrophy",
              title: "Fasilitas",
              subtitle: "Ruang tunggu nyaman dan ber-AC.",
            },
          ],
          reviews: [
            {
              name: "Andi S.",
              rating: 5,
              text: "Pelayanan sangat cepat dan tempat bersih.",
            },
            {
              name: "Budi P.",
              rating: 4,
              text: "Antrian cukup panjang tapi tertib.",
            },
          ],
        };

        setHospital(mergedData);
      } catch (error) {
        console.error("Gagal mengambil detail lokasi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailLokasi();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // [UPDATED] Handler Submit Pendaftaran ke Backend
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    // 1. Validasi Login
    if (!currentUser) {
      alert("Silakan Login terlebih dahulu untuk mendaftar donor.");
      navigate("/login-pengguna");
      return;
    }

    // 2. Validasi Kuota
    if (hospital.quotaUsed >= hospital.quotaTotal) {
      alert("Maaf, Kuota pendaftaran di lokasi ini sudah penuh.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Format Tanggal & Jam (ISO 8601)
      const combinedDateTime = new Date(`${formData.pilihTanggal}T${formData.pilihJam}:00`);
      
      // 4. Siapkan Payload
      const payload = {
        user_id: currentUser.id || currentUser.ID, 
        lokasi_id: parseInt(id),
        blood_type: formData.golonganDarah,
        donation_date: combinedDateTime.toISOString(),
        status: "Pending",
        notes: `No HP: ${formData.nomorHP}` // Simpan info kontak tambahan
      };

      // 5. Kirim Request
      await axiosClient.post("/donations", payload);

      // 6. Update UI Lokal (Optimistic Update)
      setHospital((prev) => ({ ...prev, quotaUsed: prev.quotaUsed + 1 }));
      alert("Pendaftaran Berhasil! Data Anda telah tersimpan.");
      
      // Reset sebagian form
      setFormData(prev => ({
        ...prev,
        pilihTanggal: "",
        pilihJam: "",
      }));

    } catch (error) {
      console.error("Gagal mendaftar:", error);
      const msg = error.response?.data?.error || "Terjadi kesalahan saat mendaftar.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewStarClick = (rating) =>
    setReviewForm({ ...reviewForm, rating });
  const handleReviewTextChange = (e) =>
    setReviewForm({ ...reviewForm, text: e.target.value });

  const handleSubmitReview = () => {
    if (reviewForm.rating === 0 || reviewForm.text.trim() === "") {
      alert("Mohon isi rating bintang dan ulasan.");
      return;
    }
    const newReview = {
      name: currentUser ? (currentUser.name || currentUser.Nama) : "Anda (Guest)",
      rating: reviewForm.rating,
      text: reviewForm.text,
    };
    setHospital((prev) => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      reviewCount: prev.reviewCount + 1,
    }));
    setReviewForm({ rating: 0, text: "" });
    alert("Ulasan berhasil dikirim!");
  };

  // --- HELPERS UI ---
  const renderStaticStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
    ));
  const renderIcon = (iconName) => {
    switch (iconName) {
      case "FaUsers":
        return <FaUsers />;
      case "FaHeart":
        return <FaHeart />;
      case "FaTrophy":
        return <FaTrophy />;
      default:
        return <FaInfoCircle />;
    }
  };

  if (loading)
    return (
      <div className="detail-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Memuat data lokasi...</p>
      </div>
    );
  if (!hospital)
    return (
      <div className="detail-root" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Lokasi tidak ditemukan</h2>
        <button onClick={() => navigate("/lokasi-donor")}>Kembali</button>
      </div>
    );

  const percentage = Math.min(
    (hospital.quotaUsed / hospital.quotaTotal) * 100,
    100
  );

  return (
    <div className="detail-root">
      <Header />
      <section className="detail-hero">
        <div className="detail-hero-content">
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              marginBottom: "15px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <FaArrowLeft /> Kembali
          </button>
          <h1>{hospital.name}</h1>
          <p>{hospital.fullAddress}</p>
          <div className="detail-rating">
            {renderStaticStars(Math.floor(hospital.rating))}
            <span className="rating-text">
              {hospital.rating} ({hospital.reviewCount} Review)
            </span>
          </div>
        </div>
      </section>

      <main className="detail-main">
        <div className="detail-container">
          <div className="detail-left">
            <div className="event-banner">
              <div className="event-icon">
                <FaBullhorn />
              </div>
              <div className="event-content">
                <h3>{hospital.event.title}</h3>
                <p>{hospital.event.subtitle}</p>
                <p>{hospital.event.date}</p>
              </div>
              <button className="event-info-btn">Informasi</button>
            </div>

            {/* --- BAGIAN INFORMASI STOK DARAH --- */}
            <div className="info-stok-section">
              <h3>Informasi & Stok Darah</h3>
              <div className="operational-info">
                <div className="info-item">
                  <FaClock className="info-icon" />
                  <div>
                    <strong>Jam Operasional</strong>
                    <p>{hospital.operationalHours}</p>
                  </div>
                </div>
                <div className="info-item">
                  <FaPhone className="info-icon" />
                  <div>
                    <strong>Nomor Kontak</strong>
                    <p>{hospital.phone}</p>
                  </div>
                </div>
              </div>

              <div className="blood-stock-grid">
                {Object.entries(hospital.bloodStock).map(([type, status]) => (
                  <div
                    key={type}
                    className="blood-type-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "15px",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "10px",
                      border: "1px solid #eee",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      className="blood-type"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "5px",
                      }}
                    >
                      {type}
                    </div>
                    <div
                      className="blood-status"
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color:
                          status === "Kritis"
                            ? "#e74c3c"
                            : status === "Aman"
                            ? "#27ae60"
                            : "#f39c12",
                      }}
                    >
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tahukah-section">
              <h3>Tahukah Anda?</h3>
              <div className="features-grid">
                {hospital.features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      {renderIcon(feature.icon)}
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reviews-section">
              <h3>Review dari Pendonor</h3>
              {hospital.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <strong>{review.name}</strong>
                    <div className="review-stars">
                      {renderStaticStars(review.rating)}
                    </div>
                  </div>
                  <p>{review.text}</p>
                </div>
              ))}
              <div className="add-review">
                <h4>Bagikan Pengalaman Anda</h4>
                <div
                  className="review-stars-input"
                  style={{
                    display: "flex",
                    gap: "5px",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={
                        star <= reviewForm.rating ? "star-filled" : "star-empty"
                      }
                      onClick={() => handleReviewStarClick(star)}
                      style={{
                        fontSize: "1.5rem",
                        color: star <= reviewForm.rating ? "#FFD700" : "#ccc",
                      }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Tulis pengalaman Anda di sini..."
                  className="review-textarea"
                  value={reviewForm.text}
                  onChange={handleReviewTextChange}
                ></textarea>
                <button
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                >
                  Kirim Review
                </button>
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="status-card">
              <h3>Status Pendaftaran</h3>
              <div className="quota-info">
                <span>Kuota Terisi</span>
                <span>
                  {hospital.quotaUsed} / {hospital.quotaTotal}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage >= 100 ? "#e74c3c" : "#d92b2b",
                  }}
                ></div>
              </div>
              {percentage >= 100 && (
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

            <div className="registration-card">
              <h3>Daftar Donor Disini</h3>
              <form
                onSubmit={handleSubmitRegistration}
                className="registration-form"
              >
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    required
                    readOnly={!!currentUser} // Readonly jika auto-fill dari user
                    style={currentUser ? { backgroundColor: "#f0f0f0", color: "#666" } : {}}
                  />
                </div>
                <div className="form-group">
                  <label>Nomor HP</label>
                  <input
                    type="tel"
                    name="nomorHP"
                    value={formData.nomorHP}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Golongan Darah</label>
                  <select
                    name="golonganDarah"
                    value={formData.golonganDarah}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="O-">O-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tanggal Donor Terakhir</label>
                  <input
                    type="date"
                    name="tanggalDonor"
                    value={formData.tanggalDonor}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Pilih Tanggal</label>
                  <input
                    type="date"
                    name="pilihTanggal"
                    value={formData.pilihTanggal}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pilih Jam</label>
                  <input
                    type="time"
                    name="pilihJam"
                    value={formData.pilihJam}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="register-btn"
                  disabled={
                    isSubmitting || hospital.quotaUsed >= hospital.quotaTotal
                  }
                  style={{
                    opacity:
                      isSubmitting || hospital.quotaUsed >= hospital.quotaTotal
                        ? 0.6
                        : 1,
                  }}
                >
                  {isSubmitting ? "Mendaftar..." : "Daftar Sekarang"}
                </button>
              </form>
            </div>

            <div className="question-card">
              <h3>Punya Pertanyaan?</h3>
              <p>Tanyakan langsung pada petugas medis di lokasi ini.</p>
              <button className="chat-btn" onClick={() => navigate('/konsultasi')}>
                <FaComments /> Chat dengan Petugas Medis
              </button>
            </div>
            <div className="location-card">
              <h3>Arahkan ke Lokasi</h3>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hospital.fullAddress
                )}`}
                target="_blank"
                rel="noreferrer"
                className="maps-btn"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <FaRoute /> Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}