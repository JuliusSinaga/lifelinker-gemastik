import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate(); // Hook untuk navigasi antar halaman

  return (
    <div className="role-selection-root">
      {/* Konten utama */}
      <main className="role-main-content">
        <div className="role-container">
          {/* Header */}
          <header className="role-header">
            <div className="role-logo-wrapper">
              <img
                src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
                alt="LifeLinker Logo"
                className="role-logo-image"
              />
              <h1 className="lifelinker-logo">
                <span className="red">Life</span>Linker
              </h1>
            </div>
            <h2 className="welcome-title">Selamat Datang</h2>
            <p className="subtitle">Silakan pilih peran untuk melanjutkan</p>
          </header>

          {/* Role Cards */}
          <div className="role-card-container">

            {/* === Pengguna === */}
            <div className="role-card">
              <User size={50} color="#b91c1c" />
              <h3>Pengguna</h3>
              <p>
                Login sebagai pengguna untuk donor darah atau mencari donor.
              </p>
              <div className="btn-group">
                <button
                  onClick={() => navigate("/login-pengguna")}
                  className="btn-red"
                >
                  Masuk sebagai Pengguna
                </button>
                <button
                  onClick={() => navigate("/daftar-pengguna")}
                  className="btn-gray"
                >
                  Daftar Akun
                </button>
              </div>
            </div>

            {/* === Dokter === */}
            <div className="role-card">
              <Stethoscope size={50} color="#b91c1c" />
              <h3>Dokter</h3>
              <p>
                Login sebagai dokter untuk mengelola sistem donor darah (perlu
                verifikasi STR).
              </p>
              <div className="btn-group">
                <button
                  onClick={() => navigate("/login-dokter")}
                  className="btn-red"
                >
                  Masuk sebagai Dokter
                </button>
                <button
                  onClick={() => navigate("/daftar-dokter")}
                  className="btn-gray"
                >
                  Daftar Akun
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
