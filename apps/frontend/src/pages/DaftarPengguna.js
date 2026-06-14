import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DaftarPengguna.css";
import axiosClient from "../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google"; 
import Icon from "../components/core/Icon";
import Input from "../components/core/Input";
import Button from "../components/core/Button";
export default function DaftarPengguna() {
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    birth_date: "",
    gender: "",
    phone: "",
    city: "",
    blood_type: "",
    rhesus: "",
    weight: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- LOGIC DAFTAR MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // PERBAIKAN: Konversi weight ke Integer sebelum dikirim
      const payload = {
        ...formData,
        weight: parseInt(formData.weight) || 0, 
      };

      await axiosClient.post("/users", payload);

      setNotif({
        show: true,
        type: "success",
        message: "Pendaftaran berhasil! Mengalihkan ke halaman login...",
      });

      // Reset form
      setFormData({
        name: "", email: "", password: "", birth_date: "", gender: "", 
        phone: "", city: "", blood_type: "", rhesus: "", weight: "",
      });

      setTimeout(() => {
        navigate("/login-pengguna");
      }, 2000);

    } catch (error) {
      console.error("Register Error:", error);
      const errorMessage = error.response?.data?.error || "Gagal mendaftarkan akun. Coba lagi.";
      setNotif({ show: true, type: "error", message: errorMessage });
    }

    setTimeout(() => {
      setNotif({ show: false, type: "", message: "" });
    }, 3000);
  };

  // --- LOGIC DAFTAR DENGAN GOOGLE ---
  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axiosClient.post("/login/google", {
          id_token: tokenResponse.access_token, 
        });

        const { token, user } = res.data;

        // Validasi Role: Pastikan bukan dokter/admin
        if (user.role === 'dokter' || user.role === 'admin') {
            setNotif({ 
                show: true, 
                type: "error", 
                message: "Akun Google ini sudah terdaftar sebagai Dokter/Admin. Silakan login." 
            });
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("user-login"));

        setNotif({
            show: true,
            type: "success",
            message: "Pendaftaran Google berhasil! Mengalihkan...",
        });

        setTimeout(() => {
            navigate("/beranda"); 
        }, 1500);

      } catch (err) {
        console.error("Google Register Error:", err);
        setNotif({ 
            show: true, 
            type: "error", 
            message: "Gagal mendaftar dengan Google. Silakan coba lagi." 
        });
      }
    },
    onError: () => console.log("Register Google Gagal"),
  });

  return (
    <div className="daftar-wrapper">
      <div className="daftar-container">
        
        {/* TOMBOL KEMBALI */}
        <button className="back-button-register" onClick={() => navigate("/")}>
            <Icon icon="mdi:arrow-left" /> Kembali
        </button>

        {notif.show && (
          <div
            className={`notif ${
              notif.type === "success" ? "notif-sukses" : "notif-error"
            }`}
          >
            {notif.message}
          </div>
        )}

        <header className="daftar-header">
          <h1 className="logo">
            <img
              src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
              alt="LifeLinker Logo"
              className="logo-image"
            />
            <span className="red">Life</span>Linker
          </h1>
          <h2 className="judul">Buat Akun Pendonor</h2>
          <p className="subtitle">
            Lengkapi informasi untuk menjadi bagian dari pahlawan kemanusiaan.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="form-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Informasi Akun</h3>
            <div className="form-grid">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                icon={<Icon icon="mdi:email-outline" width="20" />}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                icon={<Icon icon="mdi:lock-outline" width="20" />}
              />
            </div>
          </section>

          <section className="form-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Informasi Pribadi & Medis</h3>
            <div className="form-grid">
              <Input
                label="Nama Lengkap"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
                icon={<Icon icon="mdi:account-outline" width="20" />}
              />
              <Input
                label="Tanggal Lahir"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />
              <div className="core-input-wrapper">
                <label className="core-input-label">Jenis Kelamin</label>
                <div className="core-input-container">
                  <select
                    name="gender"
                    className="core-input-field"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <Input
                label="Nomor Telepon"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nomor Telepon"
                required
                icon={<Icon icon="mdi:phone-outline" width="20" />}
              />
              <Input
                label="Kota Domisili"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Contoh: Medan"
                required
                icon={<Icon icon="mdi:city-variant-outline" width="20" />}
              />
              <div className="core-input-wrapper">
                <label className="core-input-label">Golongan Darah</label>
                <div className="core-input-container">
                  <select
                    name="blood_type"
                    className="core-input-field"
                    value={formData.blood_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Golongan Darah</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
              <div className="core-input-wrapper">
                <label className="core-input-label">Rhesus</label>
                <div className="core-input-container">
                  <select
                    name="rhesus"
                    className="core-input-field"
                    value={formData.rhesus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="+">Positif (+)</option>
                    <option value="-">Negatif (-)</option>
                  </select>
                </div>
              </div>
              <Input
                label="Berat Badan (kg)"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Contoh: 55"
                required
                icon={<Icon icon="mdi:weight" width="20" />}
              />
            </div>
          </section>

          <Button type="submit" variant="primary" fullWidth style={{ marginTop: '8px' }}>
            Buat Akun
          </Button>

          <div className="divider" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '24px 0', color: 'var(--color-text-secondary)' }}>
            <div style={{ flex: 1, borderBottom: '1px solid var(--color-border-divider)', opacity: 0.2 }}></div>
            <span style={{ padding: '0 10px', fontSize: '12px', fontWeight: 'bold' }}>ATAU</span>
            <div style={{ flex: 1, borderBottom: '1px solid var(--color-border-divider)', opacity: 0.2 }}></div>
          </div>

          <Button variant="secondary" fullWidth onClick={() => googleRegister()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <img
              src={process.env.PUBLIC_URL + "/images/G-logo.svg"}
              alt="Google"
              style={{ width: '20px' }}
            />
            Daftar dengan Google
          </Button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Sudah punya akun? <Link to="/login-pengguna" style={{ color: 'var(--color-brand-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Masuk di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}