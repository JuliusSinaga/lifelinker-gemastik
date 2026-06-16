import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/DaftarDokter.css";
import axiosClient from "../../service/axiosClient"; 
import { useGoogleLogin } from "@react-oauth/google"; 
import Icon from "../../components/core/Icon";
import Input from "../../components/core/Input";
import Button from "../../components/core/Button";

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
            <Icon icon="mdi:arrow-left" /> Kembali
        </button>

        <h1 className="dd-title">Pendaftaran Akun Dokter</h1>

        <div className="dd-info" role="status" aria-live="polite">
          <div className="dd-info-icon" aria-hidden="true">i</div>
          <div className="dd-info-text">
            Akun Anda akan aktif setelah data dan Nomor STR berhasil diverifikasi oleh Admin.
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="form-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Informasi Akun</h3>
            <div className="dd-row">
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                icon={<Icon icon="mdi:email-outline" width="20" />}
              />
              <Input
                label="Password"
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                icon={<Icon icon="mdi:lock-outline" width="20" />}
              />
            </div>
          </section>

          <section className="form-section">
            <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Informasi Profesional & Pribadi</h3>
            <Input
              label="Nama Lengkap (dengan gelar)"
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh : Dr. Julius Sinaga, Sp.PD"
              required
              icon={<Icon icon="mdi:account-outline" width="20" />}
            />

            <div className="dd-row">
              <Input
                label="Nomor STR (Wajib)"
                type="text"
                id="str_number"
                name="str_number"
                value={form.str_number}
                onChange={handleChange}
                placeholder="Masukkan Nomor Valid Anda"
                required
                icon={<Icon icon="mdi:card-account-details-outline" width="20" />}
              />
              <Input
                label="Spesialisasi"
                type="text"
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Contoh : Penyakit Dalam"
                required
                icon={<Icon icon="mdi:stethoscope" width="20" />}
              />
            </div>

            <Input
              label="Nama Rumah Sakit / Instansi"
              type="text"
              id="hospital"
              name="hospital"
              value={form.hospital}
              onChange={handleChange}
              placeholder="Contoh : RSUP Porsea"
              required
              icon={<Icon icon="mdi:hospital-building" width="20" />}
            />

            <div className="dd-row">
              <Input
                label="Tanggal Lahir"
                type="date"
                id="birth_date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                required
              />
              <div className="core-input-wrapper">
                <label className="core-input-label">Jenis Kelamin</label>
                <div className="core-input-container">
                  <select 
                    id="gender" 
                    name="gender" 
                    className="core-input-field"
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
            </div>

            <div className="dd-row">
              <Input
                label="Nomor Telepon (WhatsApp)"
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08123xxxx"
                required
                icon={<Icon icon="mdi:phone-outline" width="20" />}
              />
              <Input
                label="Kota Domisili"
                type="text"
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Contoh : Laguboti"
                required
                icon={<Icon icon="mdi:city-variant-outline" width="20" />}
              />
            </div>
          </section>

          <Button type="submit" variant="primary" fullWidth disabled={!isValid} style={{ marginTop: '8px' }}>
            Daftar &amp; Kirim Verifikasi
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
            Sudah punya akun? <Link to="/login-dokter" style={{ color: 'var(--color-brand-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Masuk di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}