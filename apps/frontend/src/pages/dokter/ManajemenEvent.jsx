import React, { useState, useEffect } from "react";
import DokterSidebar from "../../components/SidebarDokter";
import "../../styles/ManajemenEvent.css"; 
import axiosClient from "../../service/axiosClient";

export default function ManajemenEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    target_bags: "",
  });

  const [selected, setSelected] = useState(null);

  // 1. Fetch Data
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/events");
      const data = response.data.data || [];
      // Urutkan event terbaru di atas
      const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setEvents(sorted);
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 2. Submit Request
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.title || !form.start_date || !form.location) {
      alert("Mohon lengkapi data wajib (Nama, Tanggal, Lokasi)");
      return;
    }

    try {
      const payload = {
        ...form,
        target_bags: parseInt(form.target_bags) || 0,
        status: "pending"
      };

      await axiosClient.post("/events", payload);
      alert("Permintaan Event berhasil dikirim!");
      fetchEvents(); 
      
      setForm({
        title: "", location: "", description: "",
        start_date: "", end_date: "", start_time: "", end_time: "",
        target_bags: "",
      });

    } catch (error) {
      console.error("Gagal membuat event:", error);
      alert("Gagal mengirim permintaan event.");
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      case 'completed': return 'completed';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  const activeRequests = events.filter(e => e.status !== 'completed');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <h1 className="page-title">Request Event Donor Darah</h1>

        <div className="event-container">

          {/* === FORM PENGAJUAN (GRID LAYOUT) === */}
          <div className="me-card">
            <h3 className="me-card-title">📄 Formulir Pengajuan Event</h3>

            <form onSubmit={handleSubmit} className="event-form">
              
              {/* Baris 1: Nama Event (Full Width) */}
              <div className="me-form-group">
                <label className="me-label">Nama Event</label>
                <input 
                  className="me-input"
                  name="title"
                  placeholder="Contoh: Donor Darah Sehat Bersama"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Grid 2 Kolom */}
              <div className="me-form-grid">
                <div className="me-form-group">
                  <label className="me-label">Tanggal Mulai</label>
                  <input type="date" className="me-input" name="start_date" value={form.start_date} onChange={handleChange} required />
                </div>
                <div className="me-form-group">
                  <label className="me-label">Tanggal Selesai</label>
                  <input type="date" className="me-input" name="end_date" value={form.end_date} onChange={handleChange} required />
                </div>

                <div className="me-form-group">
                  <label className="me-label">Jam Mulai</label>
                  <input type="time" className="me-input" name="start_time" value={form.start_time} onChange={handleChange} />
                </div>
                <div className="me-form-group">
                  <label className="me-label">Jam Selesai</label>
                  <input type="time" className="me-input" name="end_time" value={form.end_time} onChange={handleChange} />
                </div>

                <div className="me-form-group">
                  <label className="me-label">Lokasi Event</label>
                  <input 
                    className="me-input"
                    name="location"
                    placeholder="Contoh: Aula Utama RSUP H. Adam Malik"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="me-form-group">
                  <label className="me-label">Target Kantong Darah</label>
                  <input 
                    className="me-input"
                    name="target_bags"
                    type="number"
                    placeholder="Contoh: 50"
                    value={form.target_bags}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Deskripsi (Full Width) */}
              <div className="me-form-group">
                <label className="me-label">Deskripsi & Partner</label>
                <textarea 
                  className="me-textarea"
                  name="description"
                  placeholder="Jelaskan detail acara dan partner penyelenggara..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <button className="me-btn-submit">Kirim Pengajuan</button>
            </form>
          </div>

          {/* === TABLE REQUEST STATUS === */}
          <div className="me-card">
            <h3 className="me-card-title">📊 Status Pengajuan Event</h3>

            <div className="table-responsive">
              <table className="event-table">
                <thead>
                  <tr>
                    <th>Nama Event</th>
                    <th>Tanggal</th>
                    <th>Lokasi</th>
                    <th style={{textAlign:'center'}}>Status</th>
                    <th style={{textAlign:'center'}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center">Memuat data...</td></tr>
                  ) : activeRequests.length > 0 ? (
                    activeRequests.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.title}</strong></td>
                        <td>{formatDate(r.start_date)}</td>
                        <td>{r.location}</td>
                        <td style={{textAlign:'center'}}>
                          <span className={`me-badge ${getStatusClass(r.status)}`}>
                            {getStatusLabel(r.status)}
                          </span>
                        </td>
                        <td style={{textAlign:'center'}}>
                          <button className="me-action-btn" onClick={() => setSelected(r)}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center">Belum ada pengajuan event.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* === EVENT SELESAI (GRID) === */}
          <div className="me-card">
            <h3 className="me-card-title">🎉 Event Yang Telah Selesai</h3>

            <div className="completed-grid">
              {completedEvents.length > 0 ? (
                completedEvents.map((e) => (
                  <div className="completed-card" key={e.id}>
                    <div className="completed-top">
                      <h4>{e.title}</h4>
                      <p className="completed-date">📅 {formatDate(e.start_date)}</p>
                    </div>
                    <div className="completed-bottom">
                      <div>
                        <div className="label">Kantong Terkumpul</div>
                        <div className="big-number">{e.realization || 0}</div>
                      </div>
                      <div className="me-badge completed">Selesai</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">Belum ada event yang selesai.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* === MODAL DETAIL === */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Detail Event</h3>
            </div>
            
            <div className="modal-body">
              <div className="modal-detail-row">
                <span>Nama Event</span>
                <strong>{selected.title}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Waktu</span>
                <strong>{formatDate(selected.start_date)}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Jam</span>
                <strong>{selected.start_time || "-"} s/d {selected.end_time || "-"}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Lokasi</span>
                <strong>{selected.location}</strong>
              </div>
              <div className="modal-detail-row">
                <span>Target</span>
                <strong>{selected.target_bags} Kantong</strong>
              </div>
              <div className="modal-detail-row">
                <span>Status</span>
                <span className={`me-badge ${getStatusClass(selected.status)}`}>
                    {getStatusLabel(selected.status)}
                </span>
              </div>
              
              <div className="modal-desc">
                <strong>Deskripsi:</strong><br/>
                {selected.description || "Tidak ada deskripsi tambahan."}
              </div>
            </div>

            <button className="modal-close-btn" onClick={() => setSelected(null)}>Tutup</button>
          </div>
        </div>
      )}

    </div>
  );
}