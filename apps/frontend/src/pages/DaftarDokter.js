import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DaftarDokter.css";
import axiosClient from "../service/axiosClient"; 
import { useGoogleLogin } from "@react-oauth/google"; 
import { FaArrowLeft } from "react-icons/fa";

export default function DaftarDokter() {
  const navigate = useNavigate();
  const [notif, setNotif] = useState({ show: false, type: "", message: "" });

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",           
    str_number: "",    
    specialization: "",
    hospital: "",       
    birth_date: "",    
    gender: "",        
    phone: "",         
    city: "",           
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Cek Semua Field agar tombol aktif hanya jika semua terisi
  const isValid =
    form.email.trim() !== "" &&
    form.password.trim() !== "" &&
    form.name.trim() !== "" &&
    form.str_number.trim() !== "" &&
    form.specialization.trim() !== "" &&
    form.hospital.trim() !== "" &&
    form.birth_date.trim() !== "" &&
    form.gender.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.city.trim() !== "";

  // --- LOGIC DAFTAR MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      setNotif({
        show: true,
        type: "error",
        message: "Mohon lengkapi semua field yang tersedia.",
      });
      setTimeout(() => setNotif({ show: false, type: "", message: "" }), 3000);
      return;
    }

    const payload = {
      ...form,
      role: "dokter", 
    };

    try {
      await axiosClient.post("/users", payload); 
      
      setNotif({
        show: true,
        type: "success",
        message: "Pendaftaran Berhasil! Data Anda sedang diverifikasi Admin (1x24 Jam). Cek email Anda secara berkala.",
      });

      setTimeout(() => {
        navigate("/login-dokter"); 
      }, 4000);

    } catch (error) {
      console.error("Error Register:", error);
      const errorMsg = error.response?.data?.error || "Gagal mendaftar. Silakan coba lagi.";
      setNotif({ show: true, type: "error", message: errorMsg });
      setTimeout(() => setNotif({ show: false, type: "", message: "" }), 3000);
    }
  };

  // --- LOGIC DAFTAR DENGAN GOOGLE ---
  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axiosClient.post("/login/google", {
          id_token: tokenResponse.access_token, 
        });

        const { token, user } = res.data;

        // CEK STATUS: Apakah Pending?
        if (user.status === 'pending') {
            setNotif({ 
                show: true, 
                type: "success", 
                message: "Akun Google terhubung, namun masih MENUNGGU VERIFIKASI Admin. Silakan tunggu email konfirmasi." 
            });
            
            localStorage.clear();
            
            setTimeout(() => {
                navigate("/login-dokter");
            }, 4000);
            return;
        }

        if (user.role !== 'dokter') {
             setNotif({ 
                show: true, 
                type: "error", 
                message: "Akun ini bukan akun Dokter." 
            });
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("user-login"));

        navigate("/dashboard-dokter");

      } catch (err) {
        console.error("Google Register Error:", err);
        setNotif({ 
            show: true, 
            type: "error", 
            message: "Gagal mendaftar dengan Google. Pastikan koneksi lancar." 
        });
      }
    },
    onError: (error) => {
      alert("Registrasi dengan Google gagal. Silakan coba lagi.");
    },
  });

  return (
    <div className="dd-page">
      <div className="dd-card">
        
        {/* Notifikasi menggunakan Class CSS */}
        {notif.show && (
          <div className={`dd-notification ${notif.type}`}>
            {notif.message}
          </div>
        )}

        <button className="back-button-dokter" onClick={() => navigate("/")}>
            <FaArrowLeft /> Kembali
        </button>

        <h1 className="dd-title">Pendaftaran Akun Dokter</h1>

        <div className="dd-info" role="status" aria-live="polite">
          <div className="dd-info-icon" aria-hidden="true">i</div>
          <div className="dd-info-text">
            Akun Anda akan aktif setelah data dan Nomor STR berhasil diverifikasi oleh Admin.
          </div>
        </div>

        <form className="dd-form" onSubmit={handleSubmit} noValidate>
          <h3 className="dd-section-title">Informasi Akun</h3>

          <div className="dd-row">
            <div className="dd-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="dd-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>
          </div>

          <h3 className="dd-section-title">Informasi Profesional & Pribadi</h3>

          <div className="dd-field full">
            <label htmlFor="name">Nama Lengkap (dengan gelar)</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh : Dr. Julius Sinaga, Sp.PD"
              required
            />
          </div>

          <div className="dd-row">
            <div className="dd-field">
              <label htmlFor="str_number">Nomor STR (Wajib)</label>
              <input
                id="str_number"
                name="str_number"
                type="text"
                value={form.str_number}
                onChange={handleChange}
                placeholder="Masukkan Nomor Valid Anda"
                required
              />
            </div>

            <div className="dd-field">
              <label htmlFor="specialization">Spesialisasi</label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Contoh : Penyakit Dalam"
                required
              />
            </div>
          </div>

          <div className="dd-field full">
            <label htmlFor="hospital">Nama Rumah Sakit / Instansi</label>
            <input
              id="hospital"
              name="hospital"
              type="text"
              value={form.hospital}
              onChange={handleChange}
              placeholder="Contoh : RSUP Porsea"
              required
            />
          </div>

          <div className="dd-row">
            <div className="dd-field">
              <label htmlFor="birth_date">Tanggal Lahir</label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="dd-field">
              <label htmlFor="gender">Jenis Kelamin</label>
              <select 
                id="gender" 
                name="gender" 
                value={form.gender} 
                onChange={handleChange}
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="dd-row">
            <div className="dd-field">
              <label htmlFor="phone">Nomor Telepon (WhatsApp)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="08123xxxx"
                required
              />
            </div>
            <div className="dd-field">
              <label htmlFor="city">Kota Domisili</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Contoh : Laguboti"
                required
              />
            </div>
          </div>

          <div className="dd-submit-wrap">
            <button 
                type="submit" 
                className="dd-submit" 
                disabled={!isValid} 
            >
              Daftar &amp; Kirim Verifikasi
            </button>
          </div>

          {/* DIVIDER menggunakan Class CSS */}
          <div className="dd-divider">
            <div className="dd-divider-line"></div>
            <span className="dd-divider-text">ATAU</span>
            <div className="dd-divider-line"></div>
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

          <div className="dd-footer">
            Sudah punya akun?{" "}
            <Link to="/login-dokter" className="dd-link">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}