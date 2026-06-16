import React, { useState, useEffect, useRef, useCallback } from "react";
import DokterSidebar from "../../components/SidebarDokter";
import "../../styles/KonsultasiEdukasi.css";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

export default function KonsultasiEdukasi() {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- State Chat ---
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  // --- State FAQ & Modal ---
  const [faqs, setFaqs] = useState([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [popup, setPopup] = useState({ show: false, type: "", message: "", confirmAction: null });

  // 1. Fetch Data (Real-time Polling)
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const response = await axiosClient.get("/consultations");
      const data = response.data.data || [];

      const formattedData = data.map(item => ({
        id: item.id,
        patientName: item.User?.name || "Pasien",
        topic: item.topic,
        date: item.consultation_date,
        time: item.consultation_time,
        status: item.status,
        method: item.method || 'chat',
        link: item.meeting_link || "https://zoom.us",
        messages: (item.messages || []).map(msg => ({
          id: msg.id,
          text: msg.text,
          from: msg.sender_role || "patient",
          createdAt: msg.created_at
        }))
      }));

      // Update data utama
      setConsultations(formattedData);

      // Fetch Edukasi / FAQ
      try {
        const eduRes = await axiosClient.get("/education");
        const eduData = eduRes.data.data || [];
        const formattedFaqs = eduData.map(edu => ({
          id: edu.ID,
          question: edu.judul,
          answer: edu.konten,
          category: edu.kategori
        }));
        setFaqs(formattedFaqs);
      } catch (eduErr) {
        console.error("Gagal mengambil data edukasi:", eduErr);
      }

      // Update data terfilter (tanpa merusak pencarian yang sedang aktif)
      setFilteredConsultations(prev => {
        if (searchTerm) return prev; // Jika sedang search, jangan timpa hasil search
        return formattedData;
      });

      // Auto-select chat pertama HANYA jika belum ada yang dipilih
      if (!selectedChatId && formattedData.length > 0) {
        // Cari konsultasi chat pertama
        const firstChat = formattedData.find(c => c.method === 'chat');
        if (firstChat) setSelectedChatId(firstChat.id);
      }

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [selectedChatId, searchTerm]);

  // Initial Load & Polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Logic Pencarian Chat
  useEffect(() => {
    if (!searchTerm) {
        setFilteredConsultations(consultations);
    } else {
        const results = consultations.filter(c =>
            c.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredConsultations(results);
    }
  }, [searchTerm, consultations]);

  // Auto Scroll saat pindah chat atau ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatId, consultations]);

  // --- Filter Data untuk View ---
  const chatSessions = filteredConsultations.filter(c => c.method === 'chat');
  const videoSessions = consultations.filter(c => c.method === 'video' || c.status === 'scheduled');
  
  // Ambil Data Chat yang SEDANG AKTIF (Dipilih)
  // Logic ini memastikan perpindahan antar user berjalan mulus
  const activeChat = consultations.find(c => c.id === selectedChatId);

  // --- HANDLERS ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageDraft.trim() || !selectedChatId) return;

    setIsSending(true);
    const optimisticMsg = { from: "doctor", text: messageDraft, id: "temp-" + Date.now() };

    setConsultations(prev => prev.map(chat => {
      if (chat.id === selectedChatId) return { ...chat, messages: [...chat.messages, optimisticMsg] };
      return chat;
    }));

    const msgToSend = messageDraft;
    setMessageDraft("");

    try {
      await axiosClient.post(`/consultations/${selectedChatId}/reply`, {
        message: msgToSend,
        sender: "doctor"
      });
      fetchData(true);
    } catch (error) {
      setPopup({ show: true, type: "error", message: "Gagal mengirim pesan." });
    } finally {
      setIsSending(false);
    }
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) {
      setPopup({ show: true, type: "error", message: "Isi semua kolom!" });
      return;
    }
    const newItem = { id: Date.now(), ...newFaq };
    setFaqs([...faqs, newItem]);
    setNewFaq({ question: "", answer: "" });
    setShowFaqModal(false);
    setPopup({ show: true, type: "success", message: "FAQ ditambahkan!" });
  };

  const triggerDeleteFaq = (id) => {
    setPopup({
      show: true, type: "confirm", message: "Hapus FAQ ini?",
      confirmAction: () => {
        setFaqs(faqs.filter(f => f.id !== id));
        setPopup({ show: true, type: "success", message: "FAQ dihapus." });
        setTimeout(() => setPopup({ show: false, type: "", message: "", confirmAction: null }), 1000);
      }
    });
  };

  const closePopup = () => setPopup({ show: false, type: "", message: "", confirmAction: null });
  const handleStartSession = (link) => window.open(link, "_blank");

  return (
    <div className="dokter-layout">
      <DokterSidebar />

      <main className="dokter-main" style={{ padding: "32px", backgroundColor: "var(--color-bg-page)", minHeight: "100vh" }}>
        <h1 className="page-title" style={{ fontFamily: "var(--font-family-brand)", marginBottom: "32px" }}>Manajemen Konsultasi & Edukasi</h1>

        {/* ================= CHAT SECTION ================= */}
        <div className="ke-section" style={{ marginBottom: "40px" }}>
          <div className="ke-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="ke-section-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>Konsultasi Chat</h2>
            <div className="ke-live-indicator" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "var(--color-status-success)", padding: "4px 12px", backgroundColor: "var(--color-status-success)15", borderRadius: "16px" }}><span className="dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-status-success)" }}></span> Live Sync</div>
          </div>

          <Card variant="standard" className="ke-chat-container" style={{ display: "flex", height: "600px", overflow: "hidden", border: "1px solid var(--color-border-divider)" }}>
            {/* --- LIST SIDEBAR (Kiri) --- */}
            <div className="ke-chat-list" style={{ width: "320px", borderRight: "1px solid var(--color-border-divider)", display: "flex", flexDirection: "column", backgroundColor: "var(--color-surface-background)" }}>
              <div className="ke-search-box" style={{ padding: "16px", borderBottom: "1px solid var(--color-border-divider)", position: "relative" }}>
                <Icon icon="mdi:magnify" className="search-icon" style={{ position: "absolute", left: "28px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }} />
                <Input
                  type="text"
                  placeholder="Cari pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", paddingLeft: "40px", borderRadius: "20px", border: "1px solid var(--color-border-input)" }}
                />
              </div>

              <div className="ke-chat-items" style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {loading && !consultations.length ? (
                  <p className="ke-empty-state" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "20px" }}>Memuat...</p>
                ) : chatSessions.length > 0 ? (
                  chatSessions.map((c) => (
                    <div
                      key={c.id}
                      className={`ke-chat-item ${selectedChatId === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedChatId(c.id)} 
                      style={{ display: "flex", gap: "12px", padding: "16px", cursor: "pointer", borderBottom: "1px solid var(--color-border-divider)", backgroundColor: selectedChatId === c.id ? "var(--color-brand-primary)10" : "transparent", transition: "background-color 0.2s" }}
                    >
                      <Icon icon="mdi:account-circle" className="user-avatar" style={{ fontSize: "40px", color: selectedChatId === c.id ? "var(--color-brand-primary)" : "var(--color-text-secondary)" }} />
                      <div className="chat-info" style={{ flex: 1, minWidth: 0 }}>
                        <div className="chat-info-top" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.patientName}</h4>
                          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{c.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.topic}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="ke-empty-state" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "20px" }}>Tidak ada chat aktif.</p>
                )}
              </div>
            </div>

            {/* --- WINDOW CHAT (Kanan) --- */}
            <div className="ke-chat-window" style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "white" }}>
              {activeChat ? (
                <>
                  <div className="ke-chat-header" style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border-divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontFamily: "var(--font-family-brand)" }}>{activeChat.patientName}</h3>
                    <span className="ke-topic-badge" style={{ fontSize: "12px", fontWeight: "bold", padding: "4px 12px", borderRadius: "16px", backgroundColor: "var(--color-surface-background)", border: "1px solid var(--color-border-divider)" }}>{activeChat.topic}</span>
                  </div>

                  <div className="ke-messages-area" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "var(--color-surface-background)" }}>
                    {activeChat.messages.length > 0 ? (
                      activeChat.messages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.from}`} style={{ alignSelf: msg.from === "doctor" ? "flex-end" : "flex-start", maxWidth: "70%", padding: "12px 16px", borderRadius: "16px", backgroundColor: msg.from === "doctor" ? "var(--color-brand-primary)" : "white", color: msg.from === "doctor" ? "white" : "var(--color-text-primary)", boxShadow: "var(--shadow-sm)", borderBottomRightRadius: msg.from === "doctor" ? 0 : "16px", borderBottomLeftRadius: msg.from === "doctor" ? "16px" : 0 }}>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{msg.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="ke-empty-chat" style={{ textAlign: "center", color: "var(--color-text-secondary)", margin: "auto" }}>Belum ada percakapan.</p>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="ke-chat-input" onSubmit={handleSendMessage} style={{ padding: "16px", borderTop: "1px solid var(--color-border-divider)", display: "flex", gap: "12px" }}>
                    <Input
                      type="text"
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      disabled={isSending}
                      placeholder="Ketik pesan..."
                      style={{ flex: 1, borderRadius: "24px", border: "1px solid var(--color-border-input)" }}
                    />
                    <Button type="submit" variant="primary" disabled={isSending} style={{ width: "48px", height: "48px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSending ? "..." : <Icon icon="mdi:send" />}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="ke-no-chat" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}><p>Pilih chat untuk memulai</p></div>
              )}
            </div>
          </Card>
        </div>

        {/* ================= VIDEO SESSIONS ================= */}
        <div className="ke-section" style={{ marginBottom: "40px" }}>
          <div className="ke-header-row" style={{ marginBottom: "20px" }}><h2 className="ke-section-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>Jadwal Konsultasi Video</h2></div>
          <div className="ke-grid-sessions" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {videoSessions.length > 0 ? (
              videoSessions.map((s) => (
                <Card variant="standard" key={s.id} className="ke-session-card" style={{ padding: "24px", borderTop: "4px solid var(--color-brand-primary)" }}>
                  <div className="session-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>{s.topic}</h4>
                    <span className="ke-badge green" style={{ fontSize: "12px", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px", backgroundColor: "var(--color-status-success)20", color: "var(--color-status-success)", textTransform: "capitalize" }}>{s.status}</span>
                  </div>
                  <p className="session-patient" style={{ margin: "0 0 16px 0", color: "var(--color-text-secondary)" }}>Pasien: <strong>{s.patientName}</strong></p>
                  <div className="session-meta" style={{ display: "flex", gap: "16px", marginBottom: "24px", fontSize: "14px", color: "var(--color-text-primary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Icon icon="mdi:clock-outline" style={{ color: "var(--color-brand-primary)" }} /> {s.date}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Icon icon="mdi:video" style={{ color: "var(--color-status-info)" }} /> {s.time}</span>
                  </div>
                  <div className="session-actions">
                    <Button variant="outline" className="btn-join" onClick={() => handleStartSession(s.link)} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                        <Icon icon="mdi:video" /> Mulai Sesi
                    </Button>
                  </div>
                </Card>
              ))
            ) : <Card variant="standard" className="ke-session-card dummy" style={{ padding: "24px", textAlign: "center", color: "var(--color-text-secondary)", borderStyle: "dashed", backgroundColor: "transparent" }}><p className="session-patient">Tidak ada jadwal video.</p></Card>}
          </div>
        </div>

        {/* ================= FAQ MANAGEMENT ================= */}
        <div className="ke-section">
          <div className="ke-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 className="ke-section-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>Manajemen FAQ</h2>
            <Button variant="primary" className="ke-btn-add-faq" onClick={() => setShowFaqModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icon icon="mdi:plus" /> Tambah FAQ</Button>
          </div>
          <div className="ke-faq-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq) => (
              <Card variant="standard" key={faq.id} className="ke-faq-card" style={{ padding: "24px" }}>
                <div className="faq-question" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "16px", fontFamily: "var(--font-family-brand)", color: "var(--color-text-primary)", flex: 1 }}>Q: {faq.question}</strong>
                  <div className="faq-actions" style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                    <button className="btn-icon-small delete" onClick={() => triggerDeleteFaq(faq.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-status-error)", fontSize: "16px", padding: "4px", opacity: 0.7, transition: "opacity 0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}><Icon icon="mdi:delete" /></button>
                  </div>
                </div>
                <div className="faq-answer" style={{ color: "var(--color-text-secondary)", lineHeight: "1.6", borderTop: "1px dashed var(--color-border-divider)", paddingTop: "12px" }}>A: {faq.answer}</div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL FAQ */}
      {showFaqModal && (
        <div className="ke-modal-overlay" onClick={() => setShowFaqModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="ke-modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: "32px", width: "100%", maxWidth: "500px" }}>
            <h3 style={{ margin: "0 0 24px 0", fontFamily: "var(--font-family-brand)", fontSize: "20px" }}>Tambah FAQ Baru</h3>
            <div className="ke-modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="ke-form-group">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Pertanyaan</label>
                <Input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="Contoh: Syarat donor..." style={{ width: "100%" }} />
              </div>
              <div className="ke-form-group">
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--color-text-secondary)" }}>Jawaban</label>
                <textarea rows="4" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} placeholder="Penjelasan..." style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-brand-primary)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border-input)"} />
              </div>
            </div>
            <div className="ke-modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <Button variant="outline" className="btn-cancel" onClick={() => setShowFaqModal(false)}>Batal</Button>
              <Button variant="primary" className="btn-save" onClick={handleAddFaq}>Simpan</Button>
            </div>
          </Card>
        </div>
      )}

      {/* POPUP */}
      {popup.show && (
        <div className="ke-modal-overlay" onClick={closePopup} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Card variant="standard" className="ke-modal-box popup" onClick={(e) => e.stopPropagation()} style={{ padding: "40px", textAlign: "center", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div className={`popup-icon ${popup.type}`} style={{ fontSize: "64px", color: popup.type === "success" ? "var(--color-status-success)" : popup.type === "error" ? "var(--color-status-error)" : "var(--color-status-warning)" }}>
              {popup.type === "success" && <Icon icon="mdi:check-circle" />}
              {popup.type === "error" && <Icon icon="mdi:close-circle" />}
              {popup.type === "confirm" && <Icon icon="mdi:alert" />}
            </div>
            <h3 className="popup-title" style={{ margin: 0, fontFamily: "var(--font-family-brand)", fontSize: "24px" }}>{popup.type === "success" ? "Berhasil!" : popup.type === "error" ? "Gagal!" : "Konfirmasi"}</h3>
            <p className="popup-message" style={{ margin: 0, color: "var(--color-text-secondary)" }}>{popup.message}</p>
            <div className="ke-modal-actions centered" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px", width: "100%" }}>
              {popup.type === "confirm" ? (
                <>
                  <Button variant="outline" className="btn-cancel" onClick={closePopup} style={{ flex: 1 }}>Batal</Button>
                  <Button variant="primary" className="btn-save delete-confirm" onClick={popup.confirmAction} style={{ flex: 1, backgroundColor: "var(--color-status-error)", borderColor: "var(--color-status-error)" }}>Ya, Hapus</Button>
                </>
              ) : (
                <Button variant="primary" className="btn-save full-width" onClick={closePopup} style={{ width: "100%" }}>OK</Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}