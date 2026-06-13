import React, { useState } from "react";
import "../styles/LoginShared.css"; // Menggunakan CSS Shared
import "../styles/LoginDokter.css"; // Jika ada style khusus dokter
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../service/axiosClient";
import { useGoogleLogin } from "@react-oauth/google";
import { FaArrowLeft } from "react-icons/fa"; 

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

          {/* Judul */}
          <h3 className="welcome-title">Selamat Datang, Dok!</h3>

          {/* Pilihan Role */}
          <div className="role-buttons">
            <button
              className={role === "pengguna" ? "role-btn active" : "role-btn"}
              onClick={() => {
                setRole("pengguna");
                navigate("/login-pengguna");
              }}
            >
              Pengguna
            </button>

            <button
              className={role === "dokter" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("dokter")}
            >
              Dokter
            </button>
          </div>

          {/* Pesan Error (Style dari CSS) */}
          {error && (
            <div className="login-alert">
              {error}
            </div>
          )}

          {/* Form Login */}
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
              Masuk Sebagai Dokter
            </button>
          </form>

          <div className="divider"><span>ATAU</span></div>

          {/* Login Google Custom Button */}
          <div className="google-login-wrapper">
            <button className="google-btn" onClick={() => googleLogin()}>
              <img
                src={process.env.PUBLIC_URL + "/images/G-logo.svg"}
                alt="Google"
              />
              Masuk dengan Google
            </button>
          </div>

          {/* Link daftar */}
          <p className="register-text">
            Belum punya akun dokter? <Link to="/daftar-dokter">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginDokter;