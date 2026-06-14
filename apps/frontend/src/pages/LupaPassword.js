import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LupaPassword.css";
import axiosClient from "../service/axiosClient";
import Icon from "../components/core/Icon";

export default function LupaPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Panggil API Backend (sesuai route yang kita buat di user_controller)
      await axiosClient.post("/forgot-password", { email });

      setStatus({
        type: "success",
        message: "Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam.",
      });
      
      // Opsional: Redirect setelah beberapa detik atau biarkan user cek email
    } catch (error) {
      console.error("Forgot Password Error:", error);
      const errorMsg = error.response?.data?.error || "Gagal mengirim permintaan. Pastikan email terdaftar.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page">
      <div className="lp-card">
        {/* Tombol Kembali */}
        <button className="lp-back-btn" onClick={() => navigate("/login-pengguna")}>
          <Icon icon="mdi:arrow-left" /> Kembali ke Login
        </button>

        <div className="lp-header">
          <h1 className="lp-title">Lupa Kata Sandi?</h1>
          <p className="lp-subtitle">
            Masukkan email yang terdaftar, kami akan mengirimkan link untuk mereset kata sandi Anda.
          </p>
        </div>

        {/* Notifikasi Sukses/Error */}
        {status.message && (
          <div className={`lp-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="lp-form">
          <div className="lp-form-group">
            <label htmlFor="email">Email</label>
            <div className="lp-input-wrapper">
              <Icon icon="mdi:email" className="lp-input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: user@email.com"
                required
                className="lp-input"
              />
            </div>
          </div>

          <button type="submit" className="lp-submit-btn" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <div className="lp-footer">
          Belum punya akun? <Link to="/daftar-pengguna">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}