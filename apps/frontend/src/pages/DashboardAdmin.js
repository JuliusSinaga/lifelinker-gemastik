import React, { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import "../styles/DashboardAdmin.css";
import axiosClient from "../service/axiosClient"; // 1. Import API Client

// --- Sub-components (Tetap Sama) ---
function MetricCard({ value, title, subtitle, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        <div className="metric-subtitle">{subtitle}</div>
      </div>
      <div className="metric-icon">{icon}</div>
    </div>
  );
}

function BloodTypeCard({ type, count, color }) {
  return (
    <div className={`blood-type-card ${color}`}>
      <div className="blood-count">{count}</div>
      <div className="blood-type">{type}</div>
    </div>
  );
}

function NotificationCard({ title, message, time, type }) {
  return (
    <div className={`notification-card ${type}`}>
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
      <div className="notification-time">{time}</div>
    </div>
  );
}

function EventItem({ title, location, date }) {
  return (
    <div className="event-item">
      <div className="event-title">{title}</div>
      <div className="event-details">
        <span className="event-location">{location}</span>
        <span className="event-date">{date}</span>
      </div>
    </div>
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

        // D. Notifikasi
        setNotificationsData(data.notifications || []);

        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 4. Data Metrics untuk Render (Menggunakan State)
  const metrics = [
    { value: stats.userCount.toLocaleString(), title: "User Terdaftar", subtitle: "Seluruh Sumut", icon: "👥" },
    { value: stats.doctorCount.toLocaleString(), title: "Dokter Terverifikasi", subtitle: "Total Dokter", icon: "👨‍⚕️" },
    { value: stats.donorCount.toLocaleString(), title: "Pendonor Potensial", subtitle: "User Terdaftar", icon: "🩸" },
    { value: stats.eventCount.toLocaleString(), title: "Event Aktif", subtitle: "Berbagai Lokasi", icon: "📅" },
    { value: stats.stockCount.toLocaleString(), title: "Total Stok Darah", subtitle: "Kantong", icon: "🧪" },
    { value: "-", title: "Event Terlaksana", subtitle: "Data Belum Tersedia", icon: "✅" },
  ];

  if (loading) {
    return (
      <div className="dashboard-admin" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        <p>Memuat Data Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      {/* Sidebar Admin */}
      <SidebarAdmin />

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="content-header">
          <h1>Dashboard Administrasi</h1>
        </header>

        {/* METRIC CARDS */}
        <div className="metrics-grid">
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* BLOOD STOCK */}
        <div className="blood-stock-card">
          <h3>Stok Darah Terkini (Real-time)</h3>
          <div className="blood-types-grid">
            {bloodStockData.map((b, i) => (
              <BloodTypeCard key={i} {...b} />
            ))}
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="bottom-grid">
          {/* LEFT COLUMN */}
          <div className="left-column">
            {/* CHART (Static SVG for Visual) */}
            <div className="chart-card">
              <h4>Perkembangan Stok Darah</h4>
              <div className="chart-container">
                <svg
                  className="chart-svg"
                  viewBox="0 0 800 300"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="6"
                    points="80,230 160,180 240,150 320,130 400,160 480,140 560,170 640,150"
                  />
                  {/* Dots chart hiasan */}
                  <circle cx="80" cy="230" r="10" fill="#dc2626" />
                  <circle cx="160" cy="180" r="10" fill="#dc2626" />
                  <circle cx="240" cy="150" r="10" fill="#dc2626" />
                  <circle cx="320" cy="130" r="10" fill="#dc2626" />
                  <circle cx="400" cy="160" r="10" fill="#dc2626" />
                  <circle cx="480" cy="140" r="10" fill="#dc2626" />
                  <circle cx="560" cy="170" r="10" fill="#dc2626" />
                  <circle cx="640" cy="150" r="10" fill="#dc2626" />
                </svg>
              </div>
            </div>

            {/* EVENTS */}
            <div className="events-card">
              <h4>Event Terbaru</h4>
              <div className="events-list">
                {eventsData.length > 0 ? (
                  eventsData.map((e, i) => <EventItem key={i} {...e} />)
                ) : (
                  <p style={{ color: "#888", fontStyle: "italic", padding: "10px" }}>
                    Belum ada event terbaru.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - NOTIFICATIONS */}
          <div className="notifications-card">
            <h4>Notifikasi Terbaru</h4>
            <div className="notifications-list">
              {notificationsData.length > 0 ? (
                notificationsData.map((n, i) => (
                  <NotificationCard key={i} {...n} />
                ))
              ) : (
                <p style={{ color: "#888", fontStyle: "italic", padding: "10px" }}>
                  Tidak ada notifikasi baru.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}