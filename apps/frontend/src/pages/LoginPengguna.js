import React, { useState } from "react";
import "../styles/LoginShared.css"; // Pastikan CSS diimport
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google";
import { FaArrowLeft } from "react-icons/fa";

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
    <div className="login-container">
      <div className="login-card">
        
        {/* TOMBOL KEMBALI */}
        <button className="back-button" onClick={() => navigate("/")}>
            <FaArrowLeft /> Kembali
        </button>

        {/* Logo */}
        <div className="logo-wrapper">
          <img
            src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
            alt="LifeLinker Logo"
            className="logo-image"
          />
          <h2 className="logo-text">
            <span className="logo-life">Life</span>
            <span className="logo-bold">Linker</span>
          </h2>
        </div>

        <h3 className="welcome-title">Selamat Datang</h3>

        {/* Role Tabs */}
        <div className="role-buttons">
          <button
            className={activeTab === "pengguna" ? "role-btn active" : "role-btn"}
            onClick={() => setActiveTab("pengguna")}
          >
            Pengguna
          </button>
          <button
            className={activeTab === "dokter" ? "role-btn active" : "role-btn"}
            onClick={() => {
              setActiveTab("dokter");
              navigate("/login-dokter");
            }}
          >
            Dokter
          </button>
        </div>

        {/* Error Message (Menggunakan Class CSS) */}
        {error && (
          <div className="login-alert">
            {error}
          </div>
        )}

        {/* Form Login Manual */}
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Alamat Email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          {/* LINK LUPA PASSWORD DITAMBAHKAN DI SINI */}
          <Link to="/lupa-password" className="forgot-password-link">
            Lupa Kata Sandi?
          </Link>

          <button type="submit" className="btn-login">
            Masuk
          </button>
        </form>

        <div className="divider"><span>ATAU</span></div>

        {/* BUTTON GOOGLE CUSTOM */}
        <div className="google-login-wrapper">
          <button className="google-btn" onClick={() => googleLogin()}>
            <img
              src={process.env.PUBLIC_URL + "/images/G-logo.svg"}
              alt="Google"
            />
            Masuk dengan Google
          </button>
        </div>

        {/* Link Daftar */}
        <p className="register-text">
          Belum punya akun? <Link to="/daftar-pengguna">Daftar Sekarang</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPengguna;