import React, { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import axiosClient from "../service/axiosClient";
import "../styles/PengaturanWebAdmin.css";
import Button from "../components/core/Button";

export default function PengaturanWebAdmin() {
  const [formData, setFormData] = useState({
    mode: "auto",
    donor_count: 0,
    kantong_count: 0,
    nyawa_count: 0,
    event_count: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosClient.get("/landing-stats");
      if (response.data && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil pengaturan:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "mode" ? value : parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axiosClient.put("/admin/landing-stats", formData);
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan!" });
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pengaturan-web-container">
      <SidebarAdmin />
      <div className="pengaturan-web-content">
        <div className="page-header-admin">
          <h1>Pengaturan Web (Landing Page)</h1>
          <p>Atur statistik "Kekuatan Kolektif Kita" yang ditampilkan di halaman beranda utama.</p>
        </div>

        <div className="pengaturan-card">
          {message.text && (
            <div className={`message-box ${message.type}`} style={{ marginBottom: "20px" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="pengaturan-form">
            <div className="form-group-admin">
              <label>Mode Statistik</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="form-control-admin"
              >
                <option value="auto">Otomatis (Hitung dari Database)</option>
                <option value="manual">Manual (Masukkan Angka Sendiri)</option>
              </select>
            </div>

            {formData.mode === "manual" && (
              <>
                <div className="form-group-admin">
                  <label>Pendonor Terdaftar</label>
                  <input
                    type="number"
                    name="donor_count"
                    value={formData.donor_count}
                    onChange={handleChange}
                    className="form-control-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label>Kantong Darah Terkumpul</label>
                  <input
                    type="number"
                    name="kantong_count"
                    value={formData.kantong_count}
                    onChange={handleChange}
                    className="form-control-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label>Nyawa Terselamatkan</label>
                  <input
                    type="number"
                    name="nyawa_count"
                    value={formData.nyawa_count}
                    onChange={handleChange}
                    className="form-control-admin"
                  />
                </div>

                <div className="form-group-admin">
                  <label>Event Telah Dilaksanakan</label>
                  <input
                    type="number"
                    name="event_count"
                    value={formData.event_count}
                    onChange={handleChange}
                    className="form-control-admin"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              className="btn-submit-pengaturan"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
