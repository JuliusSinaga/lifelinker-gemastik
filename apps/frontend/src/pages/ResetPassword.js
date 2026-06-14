import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/ResetPassword.css";
import axiosClient from "../service/axiosClient";
import Icon from "../components/core/Icon";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Ambil token dari URL (contoh: /reset-password?token=12345)
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Jika tidak ada token, redirect ke login
  useEffect(() => {
    if (!token) {
      navigate("/login-pengguna");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validasi Password
    if (formData.newPassword.length < 8) {
      setStatus({ type: "error", message: "Password minimal 8 karakter." });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Konfirmasi password tidak cocok." });
      return;
    }

    setLoading(true);

    try {
      // Panggil API Backend
      await axiosClient.post("/reset-password", {
        token: token,
        new_password: formData.newPassword,
      });

      setStatus({
        type: "success",
        message: "Password berhasil diubah! Mengalihkan ke login...",
      });

      // Redirect otomatis ke login setelah 3 detik
      setTimeout(() => {
        navigate("/login-pengguna");
      }, 3000);

    } catch (error) {
      console.error("Reset Password Error:", error);
      const errorMsg = error.response?.data?.error || "Gagal mereset password. Token mungkin sudah kadaluarsa.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-header">
          <h1 className="rp-title">Buat Password Baru</h1>
          <p className="rp-subtitle">
            Silakan masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        {status.message && (
          <div className={`rp-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rp-form">
          {/* Password Baru */}
          <div className="rp-form-group">
            <label>Password Baru</label>
            <div className="rp-input-wrapper">
              <Icon icon="mdi:lock" className="rp-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                className="rp-input"
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Icon icon="mdi:eye-off" /> : <Icon icon="mdi:eye" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="rp-form-group">
            <label>Konfirmasi Password</label>
            <div className="rp-input-wrapper">
              <Icon icon="mdi:lock" className="rp-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password baru"
                required
                className="rp-input"
              />
            </div>
          </div>

          <button type="submit" className="rp-submit-btn" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}