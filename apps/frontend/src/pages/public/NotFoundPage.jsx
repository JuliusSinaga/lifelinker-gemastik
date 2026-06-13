import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/NotFoundPage.css";
import { FaHeartBroken, FaExclamationTriangle, FaArrowLeft, FaHome } from "react-icons/fa";

// Komponen ini bisa menerima props 'type' jika ingin digunakan untuk error lain (misal 500)
export default function NotFoundPage({ type = "404" }) {
  const navigate = useNavigate();

  // Konfigurasi konten berdasarkan tipe error
  const content = {
    "404": {
      code: "404",
      title: "Halaman Tidak Ditemukan",
      message: "Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau alamat URL salah.",
      icon: <FaHeartBroken className="error-icon pulse" />,
    },
    "500": {
      code: "500",
      title: "Terjadi Kesalahan Server",
      message: "Maaf, server kami sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
      icon: <FaExclamationTriangle className="error-icon" />,
    },
    "403": {
      code: "403",
      title: "Akses Ditolak",
      message: "Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.",
      icon: <FaExclamationTriangle className="error-icon" />,
    },
  };

  // Default ke 404 jika tipe tidak dikenali
  const currentError = content[type] || content["404"];

  return (
    <div className="error-page-root">
      <div className="error-container">
        <div className="error-visual">
          {currentError.icon}
        </div>
        
        <h1 className="error-code">{currentError.code}</h1>
        <h2 className="error-title">{currentError.title}</h2>
        <p className="error-message">{currentError.message}</p>

        <div className="error-actions">
          {/* Tombol Kembali ke Halaman Sebelumnya */}
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/beranda')} 
          className="btn-back">
            <FaArrowLeft /> Kembali
          </button>

          {/* Tombol Ke Beranda */}
          <Link to="/beranda" className="btn-home">
            <FaHome /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}