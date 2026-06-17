import React, { useState, useEffect } from "react";
import DokterSidebar from "../../components/SidebarDokter";
import "../../styles/DashboardDokter.css";
import axiosClient from "../../service/axiosClient";

import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";

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

  const [stokA, setStokA] = useState(0);
  const [stokB, setStokB] = useState(0);
  const [stokAB, setStokAB] = useState(0);
  const [stokO, setStokO] = useState(0);
  const [totalStok, setTotalStok] = useState(0);

  const fetchStokData = async () => {
    try {
      const res = await axiosClient.get("/stok-darah");
      const data = res.data.data || [];
      
      let sumA = 0, sumB = 0, sumAB = 0, sumO = 0;
      data.forEach(item => {
        if (item.gol_darah === "A") sumA += item.jumlah_kantong;
        else if (item.gol_darah === "B") sumB += item.jumlah_kantong;
        else if (item.gol_darah === "AB") sumAB += item.jumlah_kantong;
        else if (item.gol_darah === "O") sumO += item.jumlah_kantong;
      });

      setStokA(sumA);
      setStokB(sumB);
      setStokAB(sumAB);
      setStokO(sumO);
      setTotalStok(sumA + sumB + sumAB + sumO);
    } catch (error) {
      console.error("Gagal mengambil data stok:", error);
    }
  };

  useEffect(() => {
    fetchStokData();
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await fetchStokData();
    setIsRefreshing(false);
  };

  const chartData = {
    labels: ["A", "B", "AB", "O"],
    datasets: [
      {
        label: "Jumlah Stok",
        data: [stokA, stokB, stokAB, stokO],
        backgroundColor: ["#F13B3B", "#3B82F6", "#FFB300", "#19C26B"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>

        {/* HEADER */}
        <div className="dashboard-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 className="dashboard-title" style={{ fontFamily: "var(--font-family-brand)", margin: 0 }}>Dashboard Utama</h1>

          <Button
            variant="primary"
            className={`btn-refresh ${isRefreshing ? "loading" : ""}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="small"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 14px", borderRadius: "6px" }}
          >
            {isRefreshing ? (
              <>
                <Icon icon="mdi:sync" className="spin" /> Refreshing...
              </>
            ) : (
              <>
                <Icon icon="mdi:sync" /> Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* STATISTIK */}
        <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>

          <Card variant="standard" className="stats-card red" style={{ padding: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "36px", margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)", color: "var(--color-status-error)" }}>{totalStok.toLocaleString()}</h2>
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Total Stok Darah (Unit)</p>
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Data Aktual Sistem</span>
          </Card>

          <Card variant="standard" className="stats-card blue" style={{ padding: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "36px", margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)", color: "var(--color-status-info)" }}>89</h2>
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Pendonor Bulan Ini</p>
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Target: 120 orang</span>
          </Card>

          <Card variant="standard" className="stats-card orange" style={{ padding: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "36px", margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)", color: "var(--color-status-warning)" }}>15</h2>
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Total Event RS Kami</p>
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>12 selesai, 3 berlangsung</span>
          </Card>

          <Card variant="standard" className="stats-card green" style={{ padding: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "36px", margin: "0 0 8px 0", fontFamily: "var(--font-family-brand)", color: "var(--color-status-success)" }}>845</h2>
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Pendonor Aktif</p>
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Di rumah sakit kami</span>
          </Card>

        </div>

        {/* GRAFIK FULL WIDTH */}
        <div className="graph-full" style={{ marginBottom: "32px" }}>
          <Card variant="standard" className="graph-card" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)" }}>Perbandingan Stok Darah</h3>

            <div className="graph-wrapper" style={{ height: "300px" }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,   
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>

          </Card>
        </div>

        {/* NOTIFIKASI */}
        <Card variant="standard" className="notif-card notif-bottom" style={{ padding: "24px" }}>
          <div className="notif-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--color-border-divider)" }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-family-brand)" }}>Notifikasi Terbaru</h3>
            <Button variant="ghost" className="notif-read" style={{ fontSize: "14px" }}>Tandai Sudah Dibaca</Button>
          </div>

          <ul className="notif-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
                <span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-status-success)" }}></span> 
                <span style={{ flex: 1 }}>Request event "Bakti Sosial" disetujui Admin</span>
                <small style={{ color: "var(--color-text-secondary)" }}>2 jam lalu</small>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
                <span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-status-info)" }}></span> 
                <span style={{ flex: 1 }}>Konsultasi baru menunggu balasan</span>
                <small style={{ color: "var(--color-text-secondary)" }}>5 jam lalu</small>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
                <span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-status-warning)" }}></span> 
                <span style={{ flex: 1 }}>5 kantong darah (A+) kedaluwarsa dalam 3 hari</span>
                <small style={{ color: "var(--color-text-secondary)" }}>1 hari lalu</small>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "var(--color-surface-background)", borderRadius: "var(--radius-standard)" }}>
                <span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-status-error)" }}></span> 
                <span style={{ flex: 1 }}>12 pendonor baru terdaftar minggu ini</span>
                <small style={{ color: "var(--color-text-secondary)" }}>2 hari lalu</small>
            </li>
          </ul>

          <div className="notif-footer" style={{ marginTop: "24px", textAlign: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-brand-primary)", textDecoration: "none", fontWeight: "bold", padding: 0, font: "inherit" }}>Lihat semua notifikasi</button>
          </div>

        </Card>

      </main>
    </div>
  );
}
