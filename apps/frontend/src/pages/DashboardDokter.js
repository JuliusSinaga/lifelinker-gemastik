import React, { useState } from "react";
import DokterSidebar from "../components/SidebarDokter";
import "../styles/DashboardDokter.css";

import { FaSyncAlt } from "react-icons/fa";

// CHART JS
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function DashboardDokter() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const chartData = {
    labels: ["A", "B", "AB", "O"],
    datasets: [
      {
        label: "Jumlah Stok",
        data: [300, 200, 120, 400],
        backgroundColor: ["#e74c3c", "#3498db", "#f39c12", "#2ecc71"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main">

        {/* HEADER */}
        <div className="dashboard-top">
          <h1 className="dashboard-title">Dashboard Utama</h1>

          <button
            className={`btn-refresh ${isRefreshing ? "loading" : ""}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <FaSyncAlt className="spin" /> Refreshing...
              </>
            ) : (
              "Refresh Data"
            )}
          </button>
        </div>

        {/* STATISTIK */}
        <div className="stats-row">

          <div className="stats-card red">
            <h2>1,247</h2>
            <p>Total Stok Darah (Unit)</p>
            <span>RS Siloam Kebon Jeruk</span>
          </div>

          <div className="stats-card blue">
            <h2>89</h2>
            <p>Pendonor Bulan Ini</p>
            <span>Target: 120 orang</span>
          </div>

          <div className="stats-card orange">
            <h2>15</h2>
            <p>Total Event RS Kami</p>
            <span>12 selesai, 3 berlangsung</span>
          </div>

          <div className="stats-card green">
            <h2>845</h2>
            <p>Pendonor Aktif</p>
            <span>Di rumah sakit kami</span>
          </div>

        </div>

        {/* GRAFIK FULL WIDTH */}
        <div className="graph-full">
          <div className="graph-card">
            <h3>Perbandingan Stok Darah</h3>

            <div className="graph-wrapper">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,   // WAJIB supaya full height
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>

          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="notif-card notif-bottom">
          <div className="notif-header">
            <h3>Notifikasi Terbaru</h3>
            <button className="notif-read">Tandai Sudah Dibaca</button>
          </div>

          <ul className="notif-list">
            <li><span className="dot green"></span> Request event "Bakti Sosial" disetujui Admin — <small>2 jam lalu</small></li>
            <li><span className="dot blue"></span> Konsultasi baru menunggu balasan — <small>5 jam lalu</small></li>
            <li><span className="dot orange"></span> 5 kantong darah (A+) kedaluwarsa dalam 3 hari — <small>1 hari lalu</small></li>
            <li><span className="dot red"></span> 12 pendonor baru terdaftar minggu ini — <small>2 hari lalu</small></li>
          </ul>

          <div className="notif-footer">
            <a href="#">Lihat semua notifikasi</a>
          </div>

        </div>

      </main>
    </div>
  );
}
