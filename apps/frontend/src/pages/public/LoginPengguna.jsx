import React, { useState } from "react";
import "../../styles/LoginShared.css"; 
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

const LoginPengguna = () => {
  const navigate = useNavigate();
  // Tab default "pengguna" (digunakan untuk User Biasa DAN Admin)
  const [activeTab, setActiveTab] = useState("pengguna");
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

  // --- 1. LOGIN MANUAL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axiosClient.post("/login", {
        email: formData.email,
        password: formData.password,
      });
      
      handleAuthSuccess(response.data);
    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.error || "Email atau password salah.";
      setError(msg);
    }
  };

  // --- 2. LOGIN GOOGLE ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axiosClient.post("/login/google", {
          id_token: tokenResponse.access_token,
        });
        handleAuthSuccess(response.data);
      } catch (err) {
        console.error("Google Login Backend Error:", err);
        setError("Gagal verifikasi Google di server. Coba lagi.");
      }
    },
    onError: () => setError("Login Google Gagal."),
  });

  // --- 3. LOGIKA PENGECEKAN ROLE ---
  const handleAuthSuccess = (data) => {
    const { token, user } = data;
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    window.dispatchEvent(new Event("user-login"));

    if (user.role === "admin") {
      navigate("/dashboard-admin");
    } else if (user.role === "user" || user.role === "pengguna") {
      navigate("/beranda");
    } else if (user.role === "dokter") {
      navigate("/dashboard-dokter");
    } else {
      setError("Role akun tidak dikenali.");
    }
  };

  return (
    <div className="login-container" style={{ background: "var(--color-bg-auth)", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card variant="standard" style={{ maxWidth: '440px', width: '100%', padding: '40px', position: 'relative' }}>
        
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
            <span style={{ color: "var(--color-brand-primary)" }}>Life</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: "800" }}>Linker</span>
          </h2>
        </div>

        <h3 className="welcome-title" style={{ textAlign: "center", fontFamily: "var(--font-family-brand)", marginBottom: "24px", fontSize: "24px" }}>Selamat Datang</h3>

        {/* Role Tabs */}
        <div className="role-buttons" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Button
            variant={activeTab === "pengguna" ? "primary" : "ghost"}
            fullWidth
            onClick={() => setActiveTab("pengguna")}
            style={{ border: activeTab !== "pengguna" ? "1px solid #d1d5db" : "1px solid transparent", borderRadius: "8px" }}
          >
            Pengguna
          </Button>
          <Button
            variant={activeTab === "dokter" ? "primary" : "ghost"}
            fullWidth
            onClick={() => {
              setActiveTab("dokter");
              navigate("/login-dokter");
            }}
            style={{ border: activeTab !== "dokter" ? "1px solid #d1d5db" : "1px solid transparent", borderRadius: "8px" }}
          >
            Dokter
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: 'rgba(241, 59, 59, 0.1)', color: 'var(--color-status-error)', padding: '12px', borderRadius: 'var(--radius-standard)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Form Login Manual */}
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
          Belum punya akun? <Link to="/daftar-pengguna" style={{ color: 'var(--color-brand-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Daftar Sekarang</Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPengguna;