import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../styles/Admin.css";
import axiosClient from "../../service/axiosClient"; 
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

export default function Admin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const res = await axiosClient.post("/login", {
        email: email,
        password: password
      });

      if (res.data.token) {
        const userData = res.data.user;

        if (userData.role !== "admin") {
          setError("Akses ditolak! Akun ini bukan akun Admin.");
          return;
        }

        const sessionData = {
          ...userData,
          isLoggedIn: true
        };

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(sessionData));

        window.dispatchEvent(new Event("user-login"));
        navigate("/dashboard-admin");
      }

    } catch (err) {
      console.error("Login Admin Error:", err);
      const msg = err.response?.data?.error || "Login gagal. Periksa email dan password.";
      setError(msg);
    }
  };

  return (
    <div className="admin-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-auth)", padding: "20px" }}>
      <Card variant="standard" className="admin-card" style={{ maxWidth: "400px", width: "100%", padding: "40px", boxShadow: "var(--shadow-elevated)" }}>

        <h1 className="admin-logo" style={{ textAlign: "center", fontFamily: "var(--font-family-brand)", margin: "0 0 32px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", fontSize: "32px" }}>
          <img
            src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
            alt="LifeLinker Logo"
            className="logo-img"
            style={{ width: "48px" }}
          />
          <div><span className="red" style={{ color: "var(--color-brand-primary)" }}>Life</span><span style={{ color: "var(--color-text-primary)", fontWeight: "800" }}>Linker</span></div>
        </h1>

        <h2 className="admin-title" style={{ textAlign: "center", fontFamily: "var(--font-family-brand)", marginBottom: "24px", fontSize: "24px" }}>Selamat Datang</h2>

        {/* Tampilkan Pesan Error jika ada */}
        {error && (
          <div style={{
            backgroundColor: "var(--color-status-error)15", 
            color: "var(--color-status-error)", 
            padding: "12px", 
            borderRadius: "var(--radius-standard)", 
            marginBottom: "24px",
            fontSize: "14px",
            textAlign: "center",
            border: "1px solid var(--color-status-error)30"
          }}>
            {error}
          </div>
        )}

        {/* HANYA ADMIN */}
        <div className="admin-only-tab" style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <span style={{ padding: "8px 24px", backgroundColor: "var(--color-surface-background)", borderRadius: "24px", fontWeight: "bold", fontSize: "14px", border: "1px solid var(--color-border-divider)" }}>
            Portal Admin
          </span>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Input
            type="email"
            placeholder="Alamat Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" style={{ width: "100%", marginTop: "8px", padding: "14px" }}>
            Masuk
          </Button>
        </form>

      </Card>
    </div>
  );
}