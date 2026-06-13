import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Footer from "../components/Footer";
import "../styles/Logout.css";

export default function Logout() {
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('authData');
    
    // Show logout success message
    alert('Anda telah berhasil logout. Terima kasih telah menggunakan LifeLinker!');
    
    // Navigate to role selection
    navigate('/pilih-role');
  };

  const handleCancel = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Konten utama */}
      <main className="flex-grow">
        <div className="logout-container">
          {/* Header */}
          <header className="logout-header">
            <h1 className="lifelinker-logo">
              <span className="heart">❤</span> <span className="red">Life</span>Linker
            </h1>
            <h2 className="logout-title">Konfirmasi Logout</h2>
            <p className="subtitle">Apakah Anda yakin ingin keluar dari akun ini?</p>
          </header>

          {/* Confirmation Card */}
          <div className="logout-card-container">
            <div className="logout-card">
              <div className="logout-icon-container">
                <LogOut size={60} color="#b91c1c" />
              </div>
              <h3>Logout dari Akun</h3>
              <p>Anda akan keluar dari sesi saat ini dan perlu login kembali untuk mengakses akun Anda.</p>
              
              <div className="confirmation-buttons">
                <button
                  onClick={handleConfirmLogout}
                  className="btn-red"
                >
                  Ya, Logout
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-gray"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}