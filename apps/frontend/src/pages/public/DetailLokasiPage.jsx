import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/DetailLokasiPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

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
              icon: "mdi:account-group",
              title: "Dibutuhkan",
              subtitle: "Golongan darah O+ sangat dibutuhkan.",
            },
            {
              icon: "mdi:heart",
              title: "Pelayanan",
              subtitle: "Ramah dan profesional.",
            },
            {
              icon: "mdi:trophy",
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
      <Icon key={i} icon={i < rating ? "mdi:star" : "mdi:star-outline"} style={{ color: i < rating ? "#F59E0B" : "var(--color-border-input)" }} />
    ));

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
        <Button onClick={() => navigate("/lokasi-donor")}>Kembali</Button>
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
          <Button
            variant="ghost"
            className="btn-back"
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "white",
              paddingLeft: 0,
              marginBottom: "15px"
            }}
          >
            <Icon icon="mdi:arrow-left" width="20" /> Kembali
          </Button>
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
            <Card variant="standard" className="event-banner" style={{ padding: "24px", display: "flex", gap: "24px", alignItems: "center", marginBottom: "32px", backgroundColor: "var(--color-brand-primary)", color: "white" }}>
              <div className="event-icon" style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "16px", borderRadius: "50%" }}>
                <Icon icon="mdi:bullhorn" width="32" />
              </div>
              <div className="event-content" style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", color: "white" }}>{hospital.event.title}</h3>
                <p style={{ margin: "0 0 8px 0", opacity: 0.9 }}>{hospital.event.subtitle}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>{hospital.event.date}</p>
              </div>
              <Button variant="secondary" style={{ backgroundColor: "white", color: "var(--color-brand-primary)", border: "none" }}>Informasi</Button>
            </Card>

            {/* --- BAGIAN INFORMASI STOK DARAH --- */}
            <Card variant="standard" className="info-stok-section" style={{ padding: "32px", marginBottom: "32px" }}>
              <h3 style={{ margin: "0 0 24px 0" }}>Informasi & Stok Darah</h3>
              <div className="operational-info" style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
                <div className="info-item" style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: "1 1 200px" }}>
                  <Icon icon="mdi:clock-outline" width="24" style={{ color: "var(--color-brand-primary)" }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "4px" }}>Jam Operasional</strong>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{hospital.operationalHours}</p>
                  </div>
                </div>
                <div className="info-item" style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: "1 1 200px" }}>
                  <Icon icon="mdi:phone" width="24" style={{ color: "var(--color-brand-primary)" }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "4px" }}>Nomor Kontak</strong>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{hospital.phone}</p>
                  </div>
                </div>
              </div>

              <div className="blood-stock-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "16px" }}>
                {Object.entries(hospital.bloodStock).map(([type, status]) => (
                  <div
                    key={type}
                    className="blood-type-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                      backgroundColor: "var(--color-surface-background)",
                      borderRadius: "var(--radius-standard)",
                      border: "1px solid var(--color-border-divider)",
                    }}
                  >
                    <div
                      className="blood-type"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--color-text-primary)",
                        marginBottom: "8px",
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
                            ? "var(--color-status-error)"
                            : status === "Aman"
                            ? "var(--color-status-success)"
                            : "var(--color-status-warning)",
                      }}
                    >
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="tahukah-section" style={{ marginBottom: "32px" }}>
              <h3 style={{ marginBottom: "24px" }}>Tahukah Anda?</h3>
              <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                {hospital.features.map((feature, index) => (
                  <Card key={index} variant="standard" className="feature-card" style={{ padding: "24px", textAlign: "center" }}>
                    <div className="feature-icon" style={{ fontSize: "32px", color: "var(--color-brand-primary)", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                      <Icon icon={feature.icon} width="40" />
                    </div>
                    <h4 style={{ margin: "0 0 8px 0" }}>{feature.title}</h4>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "14px" }}>{feature.subtitle}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Card variant="standard" className="reviews-section" style={{ padding: "32px" }}>
              <h3 style={{ margin: "0 0 24px 0" }}>Review dari Pendonor</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                {hospital.reviews.map((review, index) => (
                  <div key={index} className="review-item" style={{ paddingBottom: "24px", borderBottom: index !== hospital.reviews.length - 1 ? "1px solid var(--color-border-divider)" : "none" }}>
                    <div className="review-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>{review.name}</strong>
                      <div className="review-stars" style={{ display: "flex" }}>
                        {renderStaticStars(review.rating)}
                      </div>
                    </div>
                    <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>{review.text}</p>
                  </div>
                ))}
              </div>
              <div className="add-review" style={{ backgroundColor: "var(--color-surface-background)", padding: "24px", borderRadius: "var(--radius-standard)" }}>
                <h4 style={{ margin: "0 0 16px 0" }}>Bagikan Pengalaman Anda</h4>
                <div
                  className="review-stars-input"
                  style={{
                    display: "flex",
                    gap: "8px",
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      icon={star <= reviewForm.rating ? "mdi:star" : "mdi:star-outline"}
                      onClick={() => handleReviewStarClick(star)}
                      style={{
                        fontSize: "24px",
                        color: star <= reviewForm.rating ? "#FFD700" : "var(--color-border-input)",
                      }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Tulis pengalaman Anda di sini..."
                  className="review-textarea"
                  value={reviewForm.text}
                  onChange={handleReviewTextChange}
                  style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", marginBottom: "16px", minHeight: "100px", fontFamily: "inherit" }}
                ></textarea>
                <Button
                  variant="primary"
                  onClick={handleSubmitReview}
                >
                  Kirim Review
                </Button>
              </div>
            </Card>
          </div>

          <div className="detail-right">
            <Card variant="standard" className="status-card" style={{ padding: "24px", marginBottom: "24px", backgroundColor: "var(--color-brand-primary)", color: "white" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "white" }}>Status Pendaftaran</h3>
              <div className="quota-info" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "bold" }}>
                <span>Kuota Terisi</span>
                <span>
                  {hospital.quotaUsed} / {hospital.quotaTotal}
                </span>
              </div>
              <div className="progress-bar" style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "4px", overflow: "hidden" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: percentage >= 100 ? "#ef4444" : "white",
                  }}
                ></div>
              </div>
              {percentage >= 100 && (
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
            </Card>

            <Card variant="standard" className="registration-card" style={{ padding: "24px", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 24px 0" }}>Daftar Donor Disini</h3>
              <form
                onSubmit={handleSubmitRegistration}
                className="registration-form"
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nama Lengkap</label>
                  <Input
                    type="text"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    required
                    readOnly={!!currentUser} // Readonly jika auto-fill dari user
                    style={currentUser ? { backgroundColor: "var(--color-surface-background)", color: "var(--color-text-secondary)" } : {}}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Nomor HP</label>
                  <Input
                    type="tel"
                    name="nomorHP"
                    value={formData.nomorHP}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Golongan Darah</label>
                  <select
                    name="golonganDarah"
                    value={formData.golonganDarah}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)" }}
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
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tanggal Donor Terakhir</label>
                  <Input
                    type="date"
                    name="tanggalDonor"
                    value={formData.tanggalDonor}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Pilih Tanggal</label>
                  <Input
                    type="date"
                    name="pilihTanggal"
                    value={formData.pilihTanggal}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Pilih Jam</label>
                  <Input
                    type="time"
                    name="pilihJam"
                    value={formData.pilihJam}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={
                    isSubmitting || hospital.quotaUsed >= hospital.quotaTotal
                  }
                  style={{
                    marginTop: "16px",
                    opacity:
                      isSubmitting || hospital.quotaUsed >= hospital.quotaTotal
                        ? 0.6
                        : 1,
                  }}
                >
                  {isSubmitting ? "Mendaftar..." : "Daftar Sekarang"}
                </Button>
              </form>
            </Card>

            <Card variant="standard" className="question-card" style={{ padding: "24px", marginBottom: "24px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px 0" }}>Punya Pertanyaan?</h3>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>Tanyakan langsung pada petugas medis di lokasi ini.</p>
              <Button variant="secondary" fullWidth onClick={() => navigate('/konsultasi')} style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                <Icon icon="mdi:chat-processing-outline" width="20" /> Chat dengan Petugas Medis
              </Button>
            </Card>
            
            <Card variant="standard" className="location-card" style={{ padding: "24px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 24px 0" }}>Arahkan ke Lokasi</h3>
              <Button as="a"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hospital.fullAddress
                )}`}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                fullWidth
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Icon icon="mdi:map-marker-path" width="20" /> Buka di Google Maps
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}