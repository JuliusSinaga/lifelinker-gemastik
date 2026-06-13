import React from "react";
import DokterSidebar from "../components/DokterSidebar";
import "../styles/ProfilSaya.css";

export default function ProfilSaya() {
  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main">
        <div className="profil-header">
          <h1>Profil Saya</h1>
          <button className="btn-refresh">🔄 Refresh Data</button>
        </div>

        {/* ====================== DATA PROFIL ====================== */}
        <div className="profil-card">
          <h2 className="section-title">Informasi Profesional & Pribadi</h2>

          <div className="form-grid">
            <div className="form-field full">
              <label>Nama Lengkap (dengan gelar)</label>
              <input type="text" value="Dr. Anastasya Silalahi, Sp.PD-KHOM" />
            </div>

            <div className="form-field">
              <label>Nomor STR</label>
              <input type="text" value="12345362856372897" />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input type="text" value="anastasyaasilalahi@gmail.com" />
            </div>

            <div className="form-field">
              <label>Spesialis</label>
              <input type="text" value="Spesialis Hematologi" />
            </div>

            <div className="form-field">
              <label>Instansi</label>
              <input type="text" value="RSUP H. Adam Malik" />
            </div>

            <div className="form-field">
              <label>Nomor Telepon</label>
              <input type="text" value="082117643656" />
            </div>

            <div className="form-field">
              <label>Kota Domisili</label>
              <input type="text" value="Medan" />
            </div>
          </div>

          <div className="btn-wrapper">
            <button className="btn-primary">Simpan Perubahan</button>
          </div>
        </div>

        {/* ====================== UBAH PASSWORD ====================== */}
        <div className="profil-card">
          <h2 className="section-title">Ubah Kata Sandi</h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Password Lama</label>
              <input type="password" />
            </div>

            <div className="form-field">
              <label>Password Baru</label>
              <input type="password" />
            </div>
          </div>

          <div className="btn-wrapper">
            <button className="btn-primary">Ubah Kata Sandi</button>
          </div>
        </div>
      </main>
    </div>
  );
}
