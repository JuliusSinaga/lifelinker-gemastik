import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RiwayatPage.css";
import {
  FaTint,
  FaHeartbeat,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDownload,
  FaClock,
  FaChartLine,
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient"; // 1. Import API Client

export default function RiwayatPage() {
  const navigate = useNavigate();
  
  // State Data Dinamis
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolume: 0,
    livesSaved: 0,
    averageCycle: "-",
  });
  
  // State Countdown
  const [nextDonorDate, setNextDonorDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // 1. Fetch Data User & Riwayat
  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("user");
      
      // Proteksi: Jika belum login, redirect
      if (!storedUser) {
        navigate("/login-pengguna");
        return;
      }

      const user = JSON.parse(storedUser);

      try {
        // Ambil riwayat donasi user ini
        const response = await axiosClient.get(`/donations?user_id=${user.id}`);
        const data = response.data.data || [];

        // Urutkan dari yang terbaru
        const sortedHistory = data.sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date));
        setHistory(sortedHistory);

        // --- KALKULASI STATISTIK ---
        // Filter hanya yang statusnya Approved (Berhasil)
        const approvedDonations = sortedHistory.filter(d => d.status === "Approved");
        const count = approvedDonations.length;

        // Hitung total volume (ml ke Liter)
        const totalVolMl = approvedDonations.reduce((acc, curr) => acc + curr.quantity_donated, 0);
        const totalVolL = (totalVolMl / 1000).toFixed(1);

        setStats({
          totalDonations: count,
          totalVolume: `${totalVolL} L`,
          livesSaved: count * 3, // Asumsi 1 kantong menyelamatkan 3 nyawa
          averageCycle: "90 Hari", // Default/Dummy rata-rata
        });

        // --- HITUNG TANGGAL DONOR BERIKUTNYA ---
        if (approvedDonations.length > 0) {
          const lastDate = new Date(approvedDonations[0].donation_date);
          // Tambah 3 bulan (90 hari) untuk pemulihan
          const nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + 90);
          setNextDonorDate(nextDate);
        } else {
          // Jika belum pernah donor, set tanggal besok/hari ini
          setNextDonorDate(new Date()); 
        }

      } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!nextDonorDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = nextDonorDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [nextDonorDate]);

  const handleDownloadSertifikat = (historyId) => {
    alert(`Mengunduh sertifikat untuk donor ID: ${historyId} (Simulasi)`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  // Data Statistik untuk UI
  const statsData = [
    { icon: <FaTint />, value: stats.totalDonations, label: "Total Donasi", color: "#dc2626" },
    { icon: <FaTint />, value: stats.totalVolume, label: "Total Darah Didonorkan", color: "#dc2626" },
    { icon: <FaHeartbeat />, value: stats.livesSaved, label: "Nyawa Terselamatkan", color: "#dc2626" },
    { icon: <FaChartLine />, value: stats.averageCycle, label: "Siklus Donor Rata-rata", color: "#dc2626" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="riwayat-page-root">
      <Header showUserProfile={true} />

      <main className="riwayat-main">
        <div className="riwayat-container">
          {/* Dashboard Header */}
          <section className="dashboard-header">
            <h1>Dasbor Kebaikan Anda</h1>
          </section>

          {/* Statistics Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              {statsData.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next Donor Countdown */}
          {nextDonorDate && new Date() < nextDonorDate && (
            <section className="next-donor-section">
              <div className="next-donor-card">
                <h2>Anda Bisa Donor Lagi Dalam</h2>
                <div className="countdown-container">
                  <div className="countdown-item-riwayat">
                    <div className="countdown-number-riwayat">{timeLeft.days}</div>
                    <div className="countdown-label-riwayat">Hari</div>
                  </div>
                  <div className="countdown-item-riwayat">
                    <div className="countdown-number-riwayat">{timeLeft.hours}</div>
                    <div className="countdown-label-riwayat">Jam</div>
                  </div>
                  <div className="countdown-item-riwayat">
                    <div className="countdown-number-riwayat">{timeLeft.minutes}</div>
                    <div className="countdown-label-riwayat">Menit</div>
                  </div>
                </div>
                <p style={{textAlign: 'center', marginTop: '10px', color: '#666', fontSize:'14px'}}>
                    Target: {formatDate(nextDonorDate)}
                </p>
              </div>
            </section>
          )}

          {/* History Section */}
          <section className="history-section">
            <div className="history-header">
              <h2>
                <FaClock className="history-icon" />
                Riwayat Donor Darah
              </h2>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '40px'}}>Memuat riwayat...</div>
            ) : (
                <div className="history-list">
                {history.length > 0 ? (
                    history.map((record) => (
                    <div key={record.ID} className="history-item">
                        <div className="history-date">
                        <div className="date-text">{formatDate(record.donation_date)}</div>
                        </div>

                        <div className="history-location">
                        <FaMapMarkerAlt className="location-icon" />
                        {/* Karena data lokasi spesifik belum ada di tabel donation, kita pakai default/dummy dulu */}
                        <span>RSUP H. Adam Malik (Pusat)</span>
                        </div>

                        <div className="history-details">
                        <span>
                            <strong>Gol. Darah:</strong> {record.blood_type} |{" "}
                            <strong>Jumlah:</strong> {record.quantity_donated} ml |{" "}
                            <span style={{
                                color: record.status === "Approved" ? "green" : 
                                       record.status === "Rejected" ? "red" : "orange",
                                fontWeight: "bold"
                            }}>
                                {record.status}
                            </span>
                        </span>
                        </div>

                        <div className="history-actions">
                        {record.status === "Approved" && (
                            <button
                                className="download-button"
                                onClick={() => handleDownloadSertifikat(record.ID)}
                            >
                                <FaDownload /> Unduh Sertifikat
                            </button>
                        )}
                        </div>
                    </div>
                    ))
                ) : (
                    <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                        Belum ada riwayat donor darah.
                    </div>
                )}
                </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}