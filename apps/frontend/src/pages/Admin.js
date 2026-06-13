import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import "../styles/Admin.css";
import axiosClient from "../service/axiosClient"; // 2. Import API Client

export default function Admin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State untuk pesan error

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error sebelumnya

    try {
      // 1. Kirim Request ke Backend
      const res = await axiosClient.post("/login", {
        email: email,
        password: password
      });

      // 2. Cek apakah login berhasil dan ROLE adalah ADMIN
      if (res.data.token) {
        const userData = res.data.user;

        // Validasi Role Khusus Admin
        if (userData.role !== "admin") {
          setError("Akses ditolak! Akun ini bukan akun Admin.");
          return;
        }

        // 3. Simpan data sesi
        const sessionData = {
          ...userData,
          isLoggedIn: true
        };

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(sessionData));

        // 4. Update Header & Redirect ke Dashboard Admin
        window.dispatchEvent(new Event("user-login"));
        navigate("/dashboard-admin");
      }

    } catch (err) {
      console.error("Login Admin Error:", err);
      // Tampilkan pesan error dari backend atau default
      const msg = err.response?.data?.error || "Login gagal. Periksa email dan password.";
      setError(msg);
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-card">

        <h1 className="admin-logo">
          <img
            src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
            alt="LifeLinker Logo"
            className="logo-img"
          />
          <span className="red">Life</span>Linker
        </h1>

        <h2 className="admin-title">Selamat Datang</h2>

        {/* Tampilkan Pesan Error jika ada */}
        {error && (
          <div style={{
            backgroundColor: "#fee2e2", 
            color: "#dc2626", 
            padding: "10px", 
            borderRadius: "8px", 
            marginBottom: "15px",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* HANYA ADMIN */}
        <div className="admin-only-tab">
          <button className="admin-active">Admin</button>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Alamat Email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="admin-submit">
            Masuk
          </button>
        </form>

      </div>
    </div>
  );
}