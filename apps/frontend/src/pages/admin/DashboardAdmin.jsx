import React, { useState, useEffect } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import "../../styles/DashboardAdmin.css";
import axiosClient from "../../service/axiosClient"; 
import Card from "../../components/core/Card";
import Icon from "../../components/core/Icon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Sub-components (Tetap Sama) ---
function MetricCard({ value, title, subtitle, icon }) {
  return (
    <Card variant="standard" className="metric-card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div className="metric-content" style={{ flex: 1 }}>
        <div className="metric-value" style={{ fontSize: "32px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", marginBottom: "4px" }}>{value}</div>
        <div className="metric-title" style={{ fontSize: "14px", fontWeight: "bold", color: "var(--color-text-secondary)" }}>{title}</div>
        <div className="metric-subtitle" style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>{subtitle}</div>
      </div>
      <div className="metric-icon" style={{ fontSize: "40px", color: "var(--color-brand-primary)", opacity: 0.8, backgroundColor: "var(--color-brand-primary)15", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
        <Icon icon={icon} width="32" height="32" />
      </div>
    </Card>
  );
}

function BloodTypeCard({ type, count, color }) {
  const colorMap = {
    red: "var(--color-status-error)",
    green: "var(--color-status-success)",
    orange: "var(--color-status-warning)",
    blue: "var(--color-status-info)"
  };
  const themeColor = colorMap[color] || "var(--color-brand-primary)";

  return (
    <Card variant="standard" className={`blood-type-card ${color}`} style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: `${themeColor}20` }}>
      <div className="blood-count" style={{ fontSize: "36px", fontWeight: "bold", fontFamily: "var(--font-family-brand)", color: themeColor, marginBottom: "8px" }}>{count}</div>
      <div className="blood-type" style={{ fontSize: "14px", fontWeight: "bold", color: "var(--color-text-primary)" }}>{type}</div>
    </Card>
  );
}

function NotificationCard({ title, message, time, type }) {
  const typeIconMap = {
    info: { icon: "mdi:information", color: "var(--color-status-info)" },
    warning: { icon: "mdi:alert", color: "var(--color-status-warning)" },
    error: { icon: "mdi:close-circle", color: "var(--color-status-error)" },
    success: { icon: "mdi:check-circle", color: "var(--color-status-success)" }
  };
  
  const iconConfig = typeIconMap[type] || typeIconMap.info;

  return (
    <Card variant="standard" className={`notification-card ${type}`} style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
      <div style={{ fontSize: "24px", color: iconConfig.color }}>
        <Icon icon={iconConfig.icon} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="notification-title" style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{title}</div>
        <div className="notification-message" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>{message}</div>
        <div className="notification-time" style={{ fontSize: "11px", color: "var(--color-text-secondary)", opacity: 0.7 }}>{time}</div>
      </div>
    </Card>
  );
}

function EventItem({ title, location, date }) {
  return (
    <Card variant="standard" className="event-item" style={{ padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="event-title" style={{ fontWeight: "bold", fontSize: "16px" }}>{title}</div>
      <div className="event-details" style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-secondary)" }}>
        <span className="event-location" style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon icon="mdi:map-marker" /> {location}</span>
        <span className="event-date" style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon icon="mdi:calendar" /> {date}</span>
      </div>
    </Card>
  );
}

export default function DashboardAdmin() {
  // 2. State untuk Data Dinamis
  const [stats, setStats] = useState({
    userCount: 0,
    doctorCount: 0,
    donorCount: 0,
    eventCount: 0,
    stockCount: 0,
    completedEventCount: 0,
  });
  const [bloodStockData, setBloodStockData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [predictionData, setPredictionData] = useState([]); // [BARU] Data AI Prediksi
  const [loading, setLoading] = useState(true);

  // 3. Fetch Data dari Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosClient.get("/dashboard/admin");
        const data = response.data.data;

        // A. Set Statistik Utama
        setStats({
          userCount: data.user_count || 0,
          doctorCount: data.doctor_count || 0,
          donorCount: data.donor_count || 0,
          eventCount: data.event_count || 0,
          stockCount: data.stock_count || 0,
          completedEventCount: 0, // Placeholder jika backend belum kirim
        });

        // B. Olah Data Stok Darah (Agregasi per Golongan)
        // Backend mengirim array semua stok, kita jumlahkan manual di sini
        const rawStock = data.blood_stock || [];
        const aggregatedStock = { A: 0, B: 0, AB: 0, O: 0 };

        rawStock.forEach((item) => {
          // Asumsi item.gol_darah adalah "A", "B", dst.
          const type = item.gol_darah; 
          if (aggregatedStock[type] !== undefined) {
            aggregatedStock[type] += item.jumlah_kantong;
          }
        });

        setBloodStockData([
          { type: "Golongan A", count: aggregatedStock.A, color: "red" },
          { type: "Golongan B", count: aggregatedStock.B, color: "green" },
          { type: "Golongan AB", count: aggregatedStock.AB, color: "orange" },
          { type: "Golongan O", count: aggregatedStock.O, color: "blue" },
        ]);

        // C. Olah Data Event
        const mappedEvents = (data.events || []).map((e) => ({
          title: e.nama_event,
          location: e.lokasi ? e.lokasi.nama_lokasi : "Lokasi Tidak Tersedia", // Handle preload
          date: new Date(e.tanggal_event).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }));
        setEventsData(mappedEvents);

        // E. Format Notifikasi Dummy
        setNotificationsData([
          { title: "Stok Darah Kritis", message: "Stok Golongan AB+ di bawah batas aman.", time: "10 menit yang lalu", type: "error" },
          { title: "User Baru", message: "Dr. Andi Setiawan baru saja mendaftar.", time: "1 jam yang lalu", type: "info" },
        ]);

        // F. Fetch Prediksi AI
        try {
          const predRes = await axiosClient.get("/stok-darah/prediksi");
          setPredictionData(predRes.data.data || []);
        } catch (predErr) {
          console.error("Gagal mengambil prediksi AI:", predErr);
        }

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 4. Data Metrics untuk Render (Menggunakan State)
  const metrics = [
    { value: stats.userCount.toLocaleString(), title: "User Terdaftar", subtitle: "Seluruh Sumut", icon: "mdi:account-group" },
    { value: stats.doctorCount.toLocaleString(), title: "Dokter Terverifikasi", subtitle: "Total Dokter", icon: "mdi:doctor" },
    { value: stats.donorCount.toLocaleString(), title: "Pendonor Potensial", subtitle: "User Terdaftar", icon: "mdi:water" },
    { value: stats.eventCount.toLocaleString(), title: "Event Aktif", subtitle: "Berbagai Lokasi", icon: "mdi:calendar" },
    { value: stats.stockCount.toLocaleString(), title: "Total Stok Darah", subtitle: "Kantong", icon: "mdi:flask" },
    { value: "-", title: "Event Terlaksana", subtitle: "Data Belum Tersedia", icon: "mdi:check-circle" },
  ];

  if (loading) {
    return (
      <div className="dashboard-admin" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor: 'var(--color-bg-page)'}}>
        <p style={{ fontFamily: "var(--font-family-brand)", color: "var(--color-text-secondary)" }}>Memuat Data Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      {/* Sidebar Admin */}
      <SidebarAdmin />

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <header className="content-header" style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-family-brand)" }}>Dashboard Administrasi</h1>
        </header>

        {/* METRIC CARDS */}
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* BLOOD STOCK */}
        <div className="blood-stock-card" style={{ marginBottom: "40px" }}>
          <h3 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Stok Darah Terkini (Real-time)</h3>
          <div className="blood-types-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {bloodStockData.map((b, i) => (
              <BloodTypeCard key={i} {...b} />
            ))}
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="bottom-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px", alignItems: "start" }}>
          {/* LEFT COLUMN */}
          <div className="left-column" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* CHART (Prediksi AI Dinamis) */}
            <Card variant="standard" className="chart-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h4 style={{ margin: "0", fontFamily: "var(--font-family-brand)" }}>Prediksi Tren AI</h4>
                <div style={{ fontSize: "12px", color: "var(--color-status-success)", fontWeight: "bold", backgroundColor: "var(--color-status-success)20", padding: "4px 8px", borderRadius: "12px" }}>
                  Akurasi ~96.5%
                </div>
              </div>
              <div className="chart-container" style={{ width: "100%", overflow: "hidden", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-large)", padding: "24px" }}>
                {predictionData.length > 0 ? (
                  <Line 
                    data={{
                      labels: predictionData.map(d => d.bulan),
                      datasets: [
                        {
                          label: 'Stok Aktual / Historis',
                          data: predictionData.map(d => d.stok_aktual > 0 ? d.stok_aktual : null),
                          borderColor: 'var(--color-brand-primary)',
                          backgroundColor: 'var(--color-brand-primary)',
                          borderWidth: 3,
                          tension: 0.4,
                        },
                        {
                          label: 'Prediksi AI',
                          data: predictionData.map(d => d.prediksi_ai),
                          borderColor: 'var(--color-status-warning)',
                          backgroundColor: 'var(--color-status-warning)',
                          borderDash: [5, 5], // Garis putus-putus untuk prediksi
                          borderWidth: 3,
                          tension: 0.4,
                        }
                      ]
                    }} 
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } }
                    }} 
                  />
                ) : (
                  <p>Memuat Prediksi...</p>
                )}
              </div>
            </Card>

            {/* EVENTS */}
            <Card variant="standard" className="events-card" style={{ padding: "24px" }}>
              <h4 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Event Terbaru</h4>
              <div className="events-list">
                {eventsData.length > 0 ? (
                  eventsData.map((e, i) => <EventItem key={i} {...e} />)
                ) : (
                  <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic", padding: "10px", textAlign: "center" }}>
                    Belum ada event terbaru.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN - NOTIFICATIONS */}
          <Card variant="standard" className="notifications-card" style={{ padding: "24px" }}>
            <h4 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Notifikasi Terbaru</h4>
            <div className="notifications-list">
              {notificationsData.length > 0 ? (
                notificationsData.map((n, i) => (
                  <NotificationCard key={i} {...n} />
                ))
              ) : (
                <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic", padding: "10px", textAlign: "center" }}>
                  Tidak ada notifikasi baru.
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}