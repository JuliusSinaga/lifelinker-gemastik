import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DaftarPengguna.css";
import axiosClient from "../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google"; 
import { FaArrowLeft } from "react-icons/fa"; 

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
            <FaArrowLeft /> Kembali
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

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h3>Informasi Akun</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Informasi Pribadi & Medis</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Jenis Kelamin</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nomor Telepon"
                  required
                />
              </div>
              <div className="form-group">
                <label>Kota Domisili</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Contoh: Medan"
                  required
                />
              </div>
              <div className="form-group">
                <label>Golongan Darah</label>
                <select
                  name="blood_type"
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
              <div className="form-group">
                <label>Rhesus</label>
                <select
                  name="rhesus"
                  value={formData.rhesus}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="+">Positif (+)</option>
                  <option value="-">Negatif (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Berat Badan (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Contoh: 55"
                  required
                />
              </div>
            </div>
          </section>

          <button type="submit" className="btn-submit">
            Buat Akun
          </button>

          {/* DIVIDER MENGGUNAKAN CLASS CSS */}
          <div className="dp-divider">
            <div className="dp-divider-line"></div>
            <span className="dp-divider-text">ATAU</span>
            <div className="dp-divider-line"></div>
          </div>

          <div className="google-login-wrapper">
            <button 
                type="button" 
                className="google-btn" 
                onClick={() => googleRegister()}
            >
              <img
                src={process.env.PUBLIC_URL + "/images/G-logo.svg"}
                alt="Google"
              />
              Daftar dengan Google
            </button>
          </div>

          <p className="login-link">
            Sudah punya akun? <Link to="/login-pengguna">Masuk di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}