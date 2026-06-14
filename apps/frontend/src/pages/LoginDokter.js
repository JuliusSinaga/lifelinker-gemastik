import React, { useState } from "react";
import "../styles/LoginShared.css"; 
import "../styles/LoginDokter.css"; 
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google";
import Icon from "../components/core/Icon";
import Button from "../components/core/Button";
import Card from "../components/core/Card";
import Input from "../components/core/Input";

const LoginDokter = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("dokter");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axiosClient.post("/login", {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;

      // VALIDASI: HARUS DOKTER
      if (user.role !== "dokter") {
        setError("Akses ditolak! Akun ini bukan akun Dokter. Silakan login di halaman Pengguna.");
        return;
      }

      handleAuthSuccess(token, user);

    } catch (err) {
      console.error("Login Error:", err);
      // Cek pesan error dari backend, jika 403 Forbidden (Pending) tampilkan pesan spesifik
      if (err.response?.status === 403) {
          setError(err.response.data.error); // "Akun Anda masih dalam proses verifikasi..."
      } else {
          const msg = err.response?.data?.error || "Email atau password salah.";
          setError(msg);
      }
    }
  };

  // --- LOGIC GOOGLE LOGIN ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axiosClient.post("/login/google", {
          id_token: tokenResponse.access_token,
        });
        
        const { token, user } = response.data;
        
        // 1. Cek Role
        if (user.role !== "dokter") {
            setError("Akun Google ini tidak terdaftar sebagai Dokter.");
            return;
        }

        // 2. Cek Status Pending (Untuk Dokter via Google)
        if (user.status === "pending") {
            setError("Akun Anda masih menunggu verifikasi Admin. Mohon cek email Anda.");
            return;
        }

        handleAuthSuccess(token, user);
      } catch (err) {
        console.error("Google Login Backend Error:", err);
        setError("Gagal verifikasi Google. Pastikan akun Google Anda terdaftar sebagai Dokter.");
      }
    },
    onError: () => setError("Login Google Gagal."),
  });

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("user-login"));
    navigate("/dashboard-dokter");
  };

  return (
    <>
      <div className="login-container" style={{ background: "var(--color-bg-auth)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <Card variant="standard" className="login-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", position: "relative" }}>

          {/* TOMBOL KEMBALI */}
          <Button variant="ghost" className="back-button" onClick={() => navigate("/")} style={{ position: "absolute", top: "24px", left: "24px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)" }}>
              <Icon icon="mdi:arrow-left" /> Kembali
          </Button>
          
          {/* Logo */}
          <div className="logo-wrapper" style={{ textAlign: "center", marginTop: "24px", marginBottom: "32px" }}>
            <img
              src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
              alt="LifeLinker Logo"
              className="logo-image"
              style={{ width: "64px", marginBottom: "16px" }}
            />
            <h2 className="logo-text" style={{ fontFamily: "var(--font-family-brand)", fontSize: "28px", margin: 0 }}>
              <span className="logo-life" style={{ color: "var(--color-brand-primary)" }}>Life</span>
              <span className="logo-bold" style={{ color: "var(--color-text-primary)", fontWeight: "800" }}>Linker</span>
            </h2>
          </div>

          {/* Judul */}
          <h3 className="welcome-title" style={{ textAlign: "center", fontFamily: "var(--font-family-brand)", marginBottom: "24px", fontSize: "24px" }}>Selamat Datang, Dok!</h3>

          {/* Role Tabs */}
          <div className="role-buttons" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Button
              variant={role === "pengguna" ? "primary" : "ghost"}
              fullWidth
              onClick={() => {
                setRole("pengguna");
                navigate("/login-pengguna");
              }}
            >
              Pengguna
            </Button>
            <Button
              variant={role === "dokter" ? "primary" : "ghost"}
              fullWidth
              onClick={() => setRole("dokter")}
            >
              Dokter
            </Button>
          </div>

          {/* Pesan Error */}
          {error && (
            <div style={{ backgroundColor: 'rgba(241, 59, 59, 0.1)', color: 'var(--color-status-error)', padding: '12px', borderRadius: 'var(--radius-standard)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              type="email"
              name="email"
              placeholder="Alamat Email"
              value={formData.email}
              onChange={handleChange}
              required
              icon={<Icon icon="mdi:email-outline" width="20" />}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              icon={<Icon icon="mdi:lock-outline" width="20" />}
            />
            
            {/* LINK LUPA PASSWORD */}
            <div style={{ textAlign: 'right' }}>
              <Link to="/lupa-password" style={{ color: 'var(--color-text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
                Lupa Kata Sandi?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth style={{ marginTop: '8px' }}>
              Masuk
            </Button>
          </form>

          <div className="divider" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '24px 0', color: 'var(--color-text-secondary)' }}>
            <div style={{ flex: 1, borderBottom: '1px solid var(--color-border-divider)', opacity: 0.2 }}></div>
            <span style={{ padding: '0 10px', fontSize: '12px', fontWeight: 'bold' }}>ATAU</span>
            <div style={{ flex: 1, borderBottom: '1px solid var(--color-border-divider)', opacity: 0.2 }}></div>
          </div>

          {/* BUTTON GOOGLE CUSTOM */}
          <Button variant="secondary" fullWidth onClick={() => googleLogin()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <img
              src={process.env.PUBLIC_URL + "/images/G-logo.svg"}
              alt="Google"
              style={{ width: '20px' }}
            />
            Masuk dengan Google
          </Button>

          {/* Link Daftar */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Belum punya akun dokter? <Link to="/daftar-dokter" style={{ color: 'var(--color-brand-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Daftar Sekarang</Link>
          </p>
        </Card>
      </div>
    </>
  );
};

export default LoginDokter;