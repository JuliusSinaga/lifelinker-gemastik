import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/BerandaPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

// --- Import Icons (Tambahkan FaCheckCircle, FaTimesCircle, FaRedo) ---
import {
  FaHeartbeat,
  FaSyringe,
  FaPills,
  FaStethoscope,
  FaTired,
  FaHandHoldingHeart,
  FaLightbulb,
  FaExchangeAlt,
  FaHandsHelping,
  FaUserFriends,
  FaBoxes,
  FaCalendarAlt,
  FaLifeRing,
  FaHeart,
  FaCarCrash,
  FaUserInjured,
  FaCheckCircle, // Icon baru untuk hasil positif
  FaTimesCircle, // Icon baru untuk hasil negatif
  FaRedo, // Icon untuk ulang
} from "react-icons/fa";

export default function BerandaPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    total_users: 0,
    total_kantong: 0,
    total_event: 0,
    nyawa_selamet: 0,
  });

  // --- LOGIC FLASH CARD ---
  const [currentStep, setCurrentStep] = useState(0);
  const [isEligible, setIsEligible] = useState(true); // Default dianggap sehat dulu
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      icon: <FaHeartbeat />,
      q: "Apakah Anda dalam kondisi sehat saat ini?",
      expected: "yes", // Jawaban yang diharapkan agar Lolos
    },
    {
      icon: <FaSyringe />,
      q: "Apakah Anda memiliki riwayat penyakit menular (hepatitis, HIV, TBC)?",
      expected: "no",
    },
    {
      icon: <FaPills />,
      q: "Apakah Anda sedang mengonsumsi obat-obatan pengencer darah/antibiotik?",
      expected: "no",
    },
    {
      icon: <FaStethoscope />,
      q: "Apakah dalam 6 bulan terakhir Anda menjalani operasi besar atau tato/tindik?",
      expected: "no",
    },
    {
      icon: <FaTired />,
      q: "Apakah Anda sering mengalami pusing berat atau mudah lelah tanpa sebab?",
      expected: "no",
    },
  ];

  const handleAnswer = (answer) => {
    // Cek apakah jawaban user sesuai dengan kriteria donor (expected)
    const currentQ = questions[currentStep];

    // Jika jawaban user TIDAK sama dengan expected, maka dia diskualifikasi (isEligible = false)
    if (answer !== currentQ.expected) {
      setIsEligible(false);
    }

    // Pindah ke pertanyaan berikutnya atau tampilkan hasil
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setIsEligible(true);
    setShowResult(false);
  };

  // --- END LOGIC FLASH CARD ---

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);

    const fetchStats = async () => {
      try {
        const response = await axiosClient.get("/dashboard/admin");
        const data = response.data.data;
        const totalKantong = data.stock_count || 0;

        setStats({
          total_users: data.user_count || 0,
          total_kantong: totalKantong,
          total_event: data.event_count || 0,
          nyawa_selamet: totalKantong * 3,
        });
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
        setStats({
          total_users: 15204,
          total_kantong: 45890,
          total_event: 89,
          nyawa_selamet: 137670,
        });
      }
    };
    fetchStats();
  }, []);

  // Hitung persentase progress bar
  const progressPercent = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="beranda-root">
      <Header showUserProfile={isLoggedIn} />

      {/* 1. HERO Section (TIDAK BERUBAH) */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg%20beranda%20awal.jpg)`,
          backgroundPosition: "center right",
          backgroundSize: "cover",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content-wrapper">
            <div className="hero-content">
              <h1>
                Selamatkan Nyawa
                <br />
                <span className="accent">dengan Donor Darah</span>
              </h1>
              <p className="hero-sub">
                Bergabunglah dengan ribuan pendonor darah di seluruh Indonesia.
                Satu Tetes Darah, Ribuan Harapan.
              </p>
              <Link to="/lokasi-donor" className="btn-primary">
                Cari Lokasi Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Ragu Untuk Donor? (MODIFIKASI FLASH CARD) */}
      <section className="checklist-section">
        <h2>Ragu Untuk Donor?</h2>
        <h3 className="checklist-subtitle">Cek Kelayakan Cepat!</h3>

        <div className="checklist-card flash-card-container">
          {!showResult ? (
            /* --- TAMPILAN PERTANYAAN (FLASH CARD) --- */
            <div className="quiz-content fade-in">
              <div className="progress-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progressPercent}%`,
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>

              <div className="question-header">
                <span className="step-count">
                  Pertanyaan {currentStep + 1} dari {questions.length}
                </span>
              </div>

              <div className="check-item-active">
                <div className="check-question-large">
                  <div className="icon-wrapper">
                    {questions[currentStep].icon}
                  </div>
                  <p>{questions[currentStep].q}</p>
                </div>

                <div className="answers-large">
                  <button
                    className="btn-check-yes"
                    onClick={() => handleAnswer("yes")}
                  >
                    Ya
                  </button>
                  <button
                    className="btn-check-no"
                    onClick={() => handleAnswer("no")}
                  >
                    Tidak
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- TAMPILAN HASIL (RESULT CARD) --- */
            <div className="result-content scale-in">
              {isEligible ? (
                // JIKA LOLOS
                <div className="result-success">
                  <FaCheckCircle className="result-icon success" />
                  <h4>Anda Berpotensi Bisa Donor!</h4>
                  <p>
                    Kondisi dasar Anda memenuhi syarat. Mari selamatkan nyawa
                    sekarang.
                  </p>
                  <div className="result-actions">
                    <Link to="/lokasi-donor" className="btn-primary">
                      Cari Lokasi Sekarang
                    </Link>
                    <button className="btn-reset" onClick={resetQuiz}>
                      <FaRedo /> Cek Ulang
                    </button>
                  </div>
                </div>
              ) : (
                // JIKA TIDAK LOLOS
                <div className="result-fail">
                  <FaTimesCircle className="result-icon fail" />
                  <h4>Mungkin Belum Saatnya</h4>
                  <p>
                    Berdasarkan jawaban Anda, sebaiknya konsultasikan dulu
                    dengan dokter atau tunggu kondisi membaik.
                  </p>
                  <div className="result-actions">
                    <Link to="/konsultasi" className="btn-check-yes">
                      Konsultasi Dokter
                    </Link>
                    <button className="btn-reset" onClick={resetQuiz}>
                      <FaRedo /> Cek Ulang
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* BAGIAN LAIN TETAP SAMA (About, Stats, Testimoni, dll...) */}
      {/* 3. Apa itu LifeLinker? */}
      <section className="about-section">
        <h2>
          Apa itu <span className="accent">LifeLinker?</span>
        </h2>
        <div className="about-cards-grid">
          <div className="about-card-item">
            <FaHandHoldingHeart className="about-icon" />
            <h3>Visi kami</h3>
            <p>
              Menjadi wadah peduli dan berkontribusi nyata dalam meningkatkan
              kesehatan serta ketersediaan darah.
            </p>
          </div>
          <div className="about-card-item">
            <FaLightbulb className="about-icon" />
            <h3>Misi kami</h3>
            <p>
              Mengedukasi masyarakat dan memfasilitasi proses donor yang aman,
              cepat, dan terorganisir.
            </p>
          </div>
          <div className="about-card-item">
            <FaExchangeAlt className="about-icon" />
            <h3>Tujuan Mulia</h3>
            <p>
              Platform digital penghubung pendonor darah dengan mereka yang
              membutuhkan secara efisien.
            </p>
          </div>
          <div className="about-card-item">
            <FaBoxes className="about-icon" />
            <h3>Mudah & Praktis</h3>
            <p>
              Temukan jadwal, daftar event, dan simpan riwayat donor dalam satu
              aplikasi.
            </p>
          </div>
          <div className="about-card-item">
            <FaHandsHelping className="about-icon" />
            <h3>Komunitas Solidaritas</h3>
            <p>
              Bergabunglah dengan komunitas pendonor, berbagi cerita, dan saling
              menginspirasi.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Kekuatan Kolektif Kita */}
      <section className="collective-strength-section">
        <div className="collective-strength-overlay">
          <h2>
            Kekuatan <span className="accent">Kolektif</span> Kita
          </h2>
          <p className="collective-strength-subtitle">
            Terima kasih kepada para pendonor dan relawan yang telah menjadi
            bagian dari perjalanan ini.
          </p>
          <div className="stats-grid">
            <div className="stat-item-new">
              <FaUserFriends className="stat-icon" />
              <div className="stat-number">
                {stats.total_users.toLocaleString("id-ID")}
              </div>
              <div className="stat-label">Pendonor Terdaftar</div>
            </div>
            <div className="stat-item-new">
              <FaBoxes className="stat-icon" />
              <div className="stat-number">
                {stats.total_kantong.toLocaleString("id-ID")}
              </div>
              <div className="stat-label">Kantong Darah Terkumpul</div>
            </div>
            <div className="stat-item-new">
              <FaLifeRing className="stat-icon" />
              <div className="stat-number">
                {stats.nyawa_selamet.toLocaleString("id-ID")}
              </div>
              <div className="stat-label">Nyawa Terselamatkan</div>
            </div>
            <div className="stat-item-new">
              <FaCalendarAlt className="stat-icon" />
              <div className="stat-number">
                {stats.total_event.toLocaleString("id-ID")}
              </div>
              <div className="stat-label">Event Telah Dilaksanakan</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Jejak Kebaikan Anda */}
      <section className="good-deeds-section">
        <h2>Jejak Kebaikan Anda</h2>
        <p className="good-deeds-subtitle">
          Setiap tetes darah sangat berarti. Lihat bagaimana donasi kolektif
          memberikan harapan baru.
        </p>
        <div className="good-deeds-cards-grid">
          <div className="good-deeds-card-item">
            <FaHeart className="good-deeds-icon" />
            <h3>Operasi Jantung Anak</h3>
            <p>
              <strong>Kemarin:</strong> 5 kantong darah membantu operasi jantung
              anak di RS Harapan Kita.
            </p>
          </div>
          <div className="good-deeds-card-item">
            <FaCarCrash className="good-deeds-icon" />
            <h3>Korban Kecelakaan</h3>
            <p>
              <strong>3 Hari Lalu:</strong> Stok O+ menyelamatkan korban
              kecelakaan lalu lintas di Bandung.
            </p>
          </div>
          <div className="good-deeds-card-item">
            <FaUserInjured className="good-deeds-icon" />
            <h3>Pasien Thalassemia</h3>
            <p>
              <strong>Minggu Lalu:</strong> Kebutuhan transfusi rutin pasien
              Thalassemia terpenuhi.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Testimoni */}
      <section className="testimonials-section">
        <h2>Apa Kata Mereka?</h2>
        <div className="testimonials-grid">
          <div className="testimonial-item">
            <img
              src={process.env.PUBLIC_URL + "/images/budi-avatar.png"}
              alt="Budi S."
              className="testimonial-avatar"
            />
            <div className="testimonial-content">
              <strong>Budi S., Pendonor Aktif</strong>
              <p>
                "LifeLinker membuat saya jadi rutin donor. Fitur pengingatnya
                sangat membantu!"
              </p>
            </div>
          </div>
          <div className="testimonial-item">
            <img
              src={process.env.PUBLIC_URL + "/images/siti-avatar.png"}
              alt="Siti A."
              className="testimonial-avatar"
            />
            <div className="testimonial-content">
              <strong>Siti A., Penerima Donor</strong>
              <p>
                "Anak saya selamat berkat darah yang tersedia cepat. Aplikasinya
                sangat memudahkan."
              </p>
            </div>
          </div>
          <div className="testimonial-item">
            <img
              src={process.env.PUBLIC_URL + "/images/rina-avatar.png"}
              alt="Rina W."
              className="testimonial-avatar"
            />
            <div className="testimonial-content">
              <strong>Rina W., Relawan</strong>
              <p>
                "Komunitasnya sangat positif! Senang bisa jadi bagian dari
                gerakan ini."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
