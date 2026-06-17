import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// === Public Pages ===
import BerandaPage from "./pages/public/BerandaPage";
import LokasiDonorPage from "./pages/public/LokasiDonorPage";
import StokDarahPage from "./pages/public/StokDarahPage";
import EventPage from "./pages/public/EventPage";
import RiwayatPage from "./pages/public/RiwayatPage";
import KonsultasiPage from "./pages/public/KonsultasiPage";
import DetailEventPage from "./pages/public/DetailEventPage";
import DetailLokasiPage from "./pages/public/DetailLokasiPage";
import DetailStokDarahPage from "./pages/public/DetailStokDarahPage";
import ProfilePage from "./pages/public/ProfilePage";

// === Login & Auth ===
import RoleSelection from "./pages/public/RoleSelection";
import LoginDokter from "./pages/public/LoginDokter";
import LoginPengguna from "./pages/public/LoginPengguna";
import DaftarPengguna from "./pages/public/DaftarPengguna";
import DaftarDokter from "./pages/public/DaftarDokter";
import LupaPassword from "./pages/public/LupaPassword";
import ResetPassword from "./pages/public/ResetPassword";

// === Admin Dashboard Pages ===
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ManajemenDokter from "./pages/admin/ManajemenDokter";
import ManajemenUser from "./pages/admin/ManajemenUser";
import ManajemenEventAdmin from "./pages/admin/ManajementEventAdmin";
import ManajemenPendonor from "./pages/admin/ManajemenPendonor";
import Laporan from "./pages/admin/Laporan";
import ProfilAdmin from "./pages/admin/ProfilAdmin";
import PengaturanWebAdmin from "./pages/admin/PengaturanWebAdmin";
import Logout from "./pages/public/Logout";

// === Dokter Dashboard Pages ===
import DashboardDokter from "./pages/dokter/DashboardDokter";
import ManajemenStok from "./pages/dokter/ManajemenStok";
import ManajemenEvent from "./pages/dokter/ManajemenEvent";
import KonsultasiEdukasi from "./pages/dokter/KonsultasiEdukasi";
import ProfilDokter from "./pages/dokter/ProfilDokter";

// === Components & System ===
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/public/NotFoundPage";

function AppContent() {
  const location = useLocation();
  
  // Daftar path yang tidak menampilkan footer
  const hideFooterPaths = [
    "/pilih-role", "/role-selection", 
    "/login-admin", "/login-user", "/login-dokter", "/login-pengguna", 
    "/daftar-pengguna", "/daftar-dokter",
    "/dashboard-admin", "/manajemen-dokter", "/manajemen-user", "/manajemen-event-admin", "/manajemen-pendonor", "/laporan", "/profile-admin",
    "/dashboard-dokter", "/manajemen-stok", "/manajemen-event", "/konsultasi-edukasi", "/profile-dokter",
    "/logout", "/error", "/forbidden", "/lupa-password", "/reset-password", "/profile",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        
        {/* ScrollToTop & Header ada di dalam Router context */}
        <ScrollToTop />
        {/* <Header /> */}
        
        <Routes>
          {/* Redirect default */}
          <Route path="/" element={<Navigate to="/beranda" replace />} />

          {/* === Public Routes === */}
          <Route path="/beranda" element={<BerandaPage />} />
          <Route path="/lokasi-donor" element={<LokasiDonorPage />} />
          <Route path="/lokasi-donor/:id" element={<DetailLokasiPage />} />
          <Route path="/stok-darah" element={<StokDarahPage />} />
          <Route path="/stok-darah/:id" element={<DetailStokDarahPage />} />
          <Route path="/event" element={<EventPage />} />
          <Route path="/event/:id" element={<DetailEventPage />} />
          
          {/* === User Routes (Protected) === */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'pengguna']} />}>
            <Route path="/riwayat" element={<RiwayatPage />} />
            <Route path="/konsultasi" element={<KonsultasiPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* === Dokter Route (Protected) === */}
          <Route element={<ProtectedRoute allowedRoles={['dokter']} />}>
            <Route path="/dashboard-dokter" element={<DashboardDokter />} />
            <Route path="/manajemen-stok" element={<ManajemenStok />} />
            <Route path="/manajemen-event" element={<ManajemenEvent />} />
            <Route path="/konsultasi-edukasi" element={<KonsultasiEdukasi />} />
            <Route path="/profile-dokter" element={<ProfilDokter />} />
          </Route>

          {/* === Admin Route (Protected) === */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />
            <Route path="/manajemen-dokter" element={<ManajemenDokter />} />
            <Route path="/manajemen-user" element={<ManajemenUser />} />
            <Route path="/manajemen-event-admin" element={<ManajemenEventAdmin />} />
            <Route path="/manajemen-pendonor" element={<ManajemenPendonor />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/profile-admin" element={<ProfilAdmin />} />
            <Route path="/admin/pengaturan" element={<PengaturanWebAdmin />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* === Auth Routes === */}
          <Route path="/pilih-role" element={<RoleSelection />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login-user" element={<Navigate to="/login-pengguna" replace />} />
          <Route path="/login-dokter" element={<LoginDokter />} />
          <Route path="/login-pengguna" element={<LoginPengguna />} />
          <Route path="/daftar-pengguna" element={<DaftarPengguna />} />
          <Route path="/daftar-dokter" element={<DaftarDokter />} />
          
          {/* === Utility Pages === */}
          <Route path="/lupa-password" element={<LupaPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
            
          {/* === Error Pages === */}
          <Route path="/error" element={<NotFoundPage type="500" />} />
          <Route path="/forbidden" element={<NotFoundPage type="403" />} />
          <Route path="*" element={<NotFoundPage type="404" />} />
        </Routes>
      </div>
      
      {/* Conditional Footer */}
      {!hideFooterPaths.includes(location.pathname) && <Footer />}
    </div>
  );
}

function App() {
  return (
    // Router utama dideklarasikan di sini
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;