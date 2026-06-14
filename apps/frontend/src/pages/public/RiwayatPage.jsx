import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RiwayatPage.css";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";

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
    { icon: "mdi:water", value: stats.totalDonations, label: "Total Donasi", color: "var(--color-brand-primary)" },
    { icon: "mdi:water", value: stats.totalVolume, label: "Total Darah Didonorkan", color: "var(--color-brand-primary)" },
    { icon: "mdi:heart-pulse", value: stats.livesSaved, label: "Nyawa Terselamatkan", color: "var(--color-brand-primary)" },
    { icon: "mdi:chart-line", value: stats.averageCycle, label: "Siklus Donor Rata-rata", color: "var(--color-brand-primary)" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="riwayat-page-root" style={{ backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
      <Header showUserProfile={true} />

      <main className="riwayat-main" style={{ padding: "40px 20px" }}>
        <div className="riwayat-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Dashboard Header */}
          <section className="dashboard-header" style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)" }}>Dasbor Kebaikan Anda</h1>
          </section>

          {/* Statistics Cards */}
          <section className="stats-section" style={{ marginBottom: "40px" }}>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              {statsData.map((stat, index) => (
                <Card key={index} variant="standard" className="stat-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
                  <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    <Icon icon={stat.icon} style={{ fontSize: "32px" }} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value" style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", marginBottom: "4px" }}>{stat.value}</div>
                    <div className="stat-label" style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>{stat.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Next Donor Countdown */}
          {nextDonorDate && new Date() < nextDonorDate && (
            <section className="next-donor-section" style={{ marginBottom: "40px" }}>
              <Card variant="standard" className="next-donor-card" style={{ padding: "32px", textAlign: "center", backgroundColor: "var(--color-surface-background)" }}>
                <h2 style={{ marginBottom: "24px", fontFamily: "var(--font-family-brand)" }}>Anda Bisa Donor Lagi Dalam</h2>
                <div className="countdown-container" style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
                  <div className="countdown-item-riwayat" style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "white", padding: "16px", borderRadius: "var(--radius-large)", minWidth: "100px", boxShadow: "var(--shadow-sm)" }}>
                    <div className="countdown-number-riwayat" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-brand-primary)", lineHeight: 1 }}>{timeLeft.days}</div>
                    <div className="countdown-label-riwayat" style={{ color: "var(--color-text-secondary)", marginTop: "8px", fontWeight: "500" }}>Hari</div>
                  </div>
                  <div className="countdown-item-riwayat" style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "white", padding: "16px", borderRadius: "var(--radius-large)", minWidth: "100px", boxShadow: "var(--shadow-sm)" }}>
                    <div className="countdown-number-riwayat" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-brand-primary)", lineHeight: 1 }}>{timeLeft.hours}</div>
                    <div className="countdown-label-riwayat" style={{ color: "var(--color-text-secondary)", marginTop: "8px", fontWeight: "500" }}>Jam</div>
                  </div>
                  <div className="countdown-item-riwayat" style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "white", padding: "16px", borderRadius: "var(--radius-large)", minWidth: "100px", boxShadow: "var(--shadow-sm)" }}>
                    <div className="countdown-number-riwayat" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-brand-primary)", lineHeight: 1 }}>{timeLeft.minutes}</div>
                    <div className="countdown-label-riwayat" style={{ color: "var(--color-text-secondary)", marginTop: "8px", fontWeight: "500" }}>Menit</div>
                  </div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-secondary)', fontSize: '16px', fontWeight: "bold" }}>
                    Target: {formatDate(nextDonorDate)}
                </p>
              </Card>
            </section>
          )}

          {/* History Section */}
          <section className="history-section">
            <Card variant="standard" style={{ padding: "32px" }}>
              <div className="history-header" style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-divider)", display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon icon="mdi:clock-outline" className="history-icon" style={{ fontSize: "28px", color: "var(--color-brand-primary)" }} />
                <h2 style={{ margin: 0, fontFamily: "var(--font-family-brand)" }}>Riwayat Donor Darah</h2>
              </div>

              {loading ? (
                  <div style={{textAlign: 'center', padding: '40px'}}>Memuat riwayat...</div>
              ) : (
                  <div className="history-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {history.length > 0 ? (
                      history.map((record) => (
                      <div key={record.ID} className="history-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", border: "1px solid var(--color-border-divider)", borderRadius: "var(--radius-standard)", flexWrap: "wrap", gap: "16px" }}>
                          <div className="history-date" style={{ minWidth: "120px" }}>
                            <div className="date-text" style={{ fontWeight: "bold", color: "var(--color-text-primary)" }}>{formatDate(record.donation_date)}</div>
                          </div>

                          <div className="history-location" style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)" }}>
                            <Icon icon="mdi:map-marker" className="location-icon" style={{ color: "var(--color-brand-primary)" }} />
                            {/* Karena data lokasi spesifik belum ada di tabel donation, kita pakai default/dummy dulu */}
                            <span>RSUP H. Adam Malik (Pusat)</span>
                          </div>

                          <div className="history-details" style={{ flex: 1, minWidth: "250px" }}>
                          <span>
                              <strong>Gol. Darah:</strong> {record.blood_type} |{" "}
                              <strong>Jumlah:</strong> {record.quantity_donated} ml |{" "}
                              <span style={{
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  backgroundColor: record.status === "Approved" ? "var(--color-status-success)20" : 
                                         record.status === "Rejected" ? "var(--color-status-error)20" : "var(--color-status-warning)20",
                                  color: record.status === "Approved" ? "var(--color-status-success)" : 
                                         record.status === "Rejected" ? "var(--color-status-error)" : "var(--color-status-warning)",
                                  fontWeight: "bold"
                              }}>
                                  {record.status}
                              </span>
                          </span>
                          </div>

                          <div className="history-actions" style={{ minWidth: "180px", textAlign: "right" }}>
                          {record.status === "Approved" && (
                              <Button
                                  variant="outline"
                                  className="download-button"
                                  onClick={() => handleDownloadSertifikat(record.ID)}
                              >
                                  <Icon icon="mdi:download" /> Unduh Sertifikat
                              </Button>
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
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}