import React, { useState, useEffect, useRef, useCallback } from "react";
import DokterSidebar from "../components/SidebarDokter";
import "../styles/KonsultasiEdukasi.css";
import axiosClient from "../service/axiosClient";
import { FaVideo, FaEdit, FaTrash, FaClock, FaPaperPlane, FaSearch, FaUserCircle, FaPlus, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

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
  const [faqs, setFaqs] = useState([
    { id: 1, question: "Apakah donor darah memiliki efek samping?", answer: "Efek samping umumnya ringan seperti pusing. Istirahat cukup sebelum donor." },
    { id: 2, question: "Bolehkah berdonor saat menstruasi?", answer: "Boleh, asalkan Hb normal (>12.5 g/dL) dan tidak sedang nyeri haid berlebih." }
  ]);
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

      <main className="dokter-main">
        <h1 className="page-title">Manajemen Konsultasi & Edukasi</h1>

        {/* ================= CHAT SECTION ================= */}
        <div className="ke-section">
          <div className="ke-header-row">
            <h2 className="ke-section-title">Konsultasi Chat</h2>
            <div className="ke-live-indicator"><span className="dot"></span> Live Sync</div>
          </div>

          <div className="ke-chat-container">
            {/* --- LIST SIDEBAR (Kiri) --- */}
            <div className="ke-chat-list">
              <div className="ke-search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari pasien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="ke-chat-items">
                {loading && !consultations.length ? (
                  <p className="ke-empty-state">Memuat...</p>
                ) : chatSessions.length > 0 ? (
                  chatSessions.map((c) => (
                    <div
                      key={c.id}
                      className={`ke-chat-item ${selectedChatId === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedChatId(c.id)} // KLIK DISINI UTK PINDAH CHAT
                    >
                      <FaUserCircle className="user-avatar" />
                      <div className="chat-info">
                        <div className="chat-info-top">
                          <h4>{c.patientName}</h4>
                          <span>{c.time}</span>
                        </div>
                        <p>{c.topic}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="ke-empty-state">Tidak ada chat aktif.</p>
                )}
              </div>
            </div>

            {/* --- WINDOW CHAT (Kanan) --- */}
            <div className="ke-chat-window">
              {activeChat ? (
                <>
                  <div className="ke-chat-header">
                    <h3>{activeChat.patientName}</h3>
                    <span className="ke-topic-badge">{activeChat.topic}</span>
                  </div>

                  <div className="ke-messages-area">
                    {activeChat.messages.length > 0 ? (
                      activeChat.messages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.from}`}>
                          <p>{msg.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="ke-empty-chat">Belum ada percakapan.</p>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form className="ke-chat-input" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      disabled={isSending}
                      placeholder="Ketik pesan..."
                    />
                    <button type="submit" className="btn-send" disabled={isSending}>
                      {isSending ? "..." : <FaPaperPlane />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="ke-no-chat"><p>Pilih chat untuk memulai</p></div>
              )}
            </div>
          </div>
        </div>

        {/* ================= VIDEO SESSIONS ================= */}
        <div className="ke-section">
          <div className="ke-header-row"><h2 className="ke-section-title">Jadwal Konsultasi Video</h2></div>
          <div className="ke-grid-sessions">
            {videoSessions.length > 0 ? (
              videoSessions.map((s) => (
                <div key={s.id} className="ke-session-card">
                  <div className="session-top">
                    <h4>{s.topic}</h4>
                    <span className="ke-badge green">{s.status}</span>
                  </div>
                  <p className="session-patient">Pasien: {s.patientName}</p>
                  <div className="session-meta">
                    <span><FaClock /> {s.date}</span><span><FaVideo /> {s.time}</span>
                  </div>
                  <div className="session-actions">
                    <button className="btn-join" onClick={() => handleStartSession(s.link)}>Mulai Sesi</button>
                  </div>
                </div>
              ))
            ) : <div className="ke-session-card dummy"><p className="session-patient">Tidak ada jadwal video.</p></div>}
          </div>
        </div>

        {/* ================= FAQ MANAGEMENT ================= */}
        <div className="ke-section">
          <div className="ke-header-row">
            <h2 className="ke-section-title">Manajemen FAQ</h2>
            <button className="ke-btn-add-faq" onClick={() => setShowFaqModal(true)}><FaPlus /> Tambah FAQ</button>
          </div>
          <div className="ke-faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="ke-faq-card">
                <div className="faq-question">
                  <strong>Q: {faq.question}</strong>
                  <div className="faq-actions">
                    <button className="btn-icon-small delete" onClick={() => triggerDeleteFaq(faq.id)}><FaTrash /></button>
                  </div>
                </div>
                <div className="faq-answer">A: {faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL FAQ */}
      {showFaqModal && (
        <div className="ke-modal-overlay" onClick={() => setShowFaqModal(false)}>
          <div className="ke-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah FAQ Baru</h3>
            <div className="ke-modal-body">
              <div className="ke-form-group">
                <label>Pertanyaan</label>
                <input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="Contoh: Syarat donor..." />
              </div>
              <div className="ke-form-group">
                <label>Jawaban</label>
                <textarea rows="3" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} placeholder="Penjelasan..." />
              </div>
            </div>
            <div className="ke-modal-actions">
              <button className="btn-cancel" onClick={() => setShowFaqModal(false)}>Batal</button>
              <button className="btn-save" onClick={handleAddFaq}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP */}
      {popup.show && (
        <div className="ke-modal-overlay" onClick={closePopup}>
          <div className="ke-modal-box popup" onClick={(e) => e.stopPropagation()}>
            <div className={`popup-icon ${popup.type}`}>
              {popup.type === "success" && <FaCheckCircle />}
              {popup.type === "error" && <FaTimesCircle />}
              {popup.type === "confirm" && <FaExclamationTriangle />}
            </div>
            <h3 className="popup-title">{popup.type === "success" ? "Berhasil!" : popup.type === "error" ? "Gagal!" : "Konfirmasi"}</h3>
            <p className="popup-message">{popup.message}</p>
            <div className="ke-modal-actions centered">
              {popup.type === "confirm" ? (
                <>
                  <button className="btn-cancel" onClick={closePopup}>Batal</button>
                  <button className="btn-save delete-confirm" onClick={popup.confirmAction}>Ya, Hapus</button>
                </>
              ) : (
                <button className="btn-save full-width" onClick={closePopup}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}