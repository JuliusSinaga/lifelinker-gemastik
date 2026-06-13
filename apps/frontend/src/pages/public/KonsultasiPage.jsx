import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../styles/KonsultasiPage.css"; 
import {
  FaPaperPlane,
  FaVideo,
  FaEnvelope,
  FaQuestionCircle,
  FaUserMd,
  FaSearch,
  FaPlus,
  FaTimes,
  FaUser
} from "react-icons/fa";
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";

const KonsultasiPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- State Data Utama ---
  const [chatSessions, setChatSessions] = useState([]); 
  const [videoSessions, setVideoSessions] = useState([]);
  
  // --- State Chat Window ---
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // --- State Modal "Mulai Chat Baru" ---
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [searchDoctorTerm, setSearchDoctorTerm] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // --- State FAQ & Email ---
  const [emailForm, setEmailForm] = useState({ email: "", question: "" });
  const [emailStatus, setEmailStatus] = useState(null); // 'sending', 'success', 'error'

  const [faqs] = useState([
    {
      id: 1,
      question: "Apakah donor darah memiliki efek samping?",
      answer: "Efek samping umumnya ringan seperti pusing atau memar. Pastikan istirahat cukup dan minum banyak cairan setelahnya.",
    },
    {
      id: 2,
      question: "Bolehkah saya berdonor jika sedang menstruasi?",
      answer: "Boleh, selama Anda tidak merasa lemah atau pusing dan kadar Hb Anda memenuhi syarat (minimal 12,5 g/dl).",
    },
  ]);

  // 1. Cek Login & Load User Info
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
      fetchConsultationData();
    }
  }, []);

  // 2. Fetch Data Konsultasi (Chat & Video)
  const fetchConsultationData = useCallback(async (isBackground = false) => {
    try {
      const response = await axiosClient.get("/consultations");
      const data = response.data.data || [];

      // A. Chat Sessions
      const chats = data
        .filter((c) => c.method === "chat" && c.status !== "Completed")
        .map((c) => {
            const lastMsg = c.messages && c.messages.length > 0 
                ? c.messages[c.messages.length - 1].text 
                : "Mulai percakapan...";
            
            return {
                id: c.id,
                doctorId: c.DoctorID,
                doctorName: c.Doctor?.name || "Dokter LifeLinker",
                topic: c.topic,
                lastMessage: lastMsg,
                time: c.consultation_time,
                avatar: c.Doctor?.photo_url || "/images/dokter-tuti.png",
                messages: c.messages || [],
            };
        });
      setChatSessions(chats);

      // B. Video Sessions
      const videos = data
        .filter((c) => c.method === "video" || c.meeting_link)
        .map((v) => ({
          id: v.id,
          doctor: v.Doctor?.name || "Dokter LifeLinker",
          topic: v.topic,
          date: v.consultation_date,
          time: v.consultation_time,
          status: v.status === "Scheduled" ? "available" : "full",
          avatar: v.Doctor?.photo_url || "/images/dokter-anas.jpg",
          link: v.meeting_link,
        }));
      setVideoSessions(videos);

    } catch (error) {
      console.error("Gagal load data:", error);
    }
  }, []);

  // 3. Efek Sinkronisasi Pesan
  useEffect(() => {
    if (chatSessions.length > 0) {
        const targetId = activeConsultationId || chatSessions[0].id;
        const session = chatSessions.find(c => c.id === targetId);
        
        if (session) {
            if (!activeConsultationId) setActiveConsultationId(targetId);
            const formattedMsgs = (session.messages || []).map((msg) => ({
                id: msg.id,
                sender: msg.sender_role === "patient" ? "user" : "doctor",
                message: msg.text,
                name: msg.sender_role === "patient" ? "Saya" : session.doctorName,
                avatar: msg.sender_role === "patient" 
                    ? (currentUser?.photo_url || null) 
                    : session.avatar,
            }));
            setMessages(formattedMsgs);
        }
    }
  }, [chatSessions, activeConsultationId, currentUser]);

  // 4. Polling Real-time
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => fetchConsultationData(true), 3000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchConsultationData]);

  // 5. Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // --- HANDLERS CHAT & MODAL ---

  const handleSelectChat = (id) => setActiveConsultationId(id);

  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    try {
        const res = await axiosClient.get("/users");
        const allUsers = res.data.data || [];
        const doctors = allUsers.filter((u) => u.role === "dokter");
        setAvailableDoctors(doctors);
    } catch (err) {
        console.error("Gagal ambil data dokter:", err);
    }
  };

  const startNewChat = async (doctor) => {
    const existingChat = chatSessions.find((c) => c.doctorId === doctor.id);
    if (existingChat) {
      setActiveConsultationId(existingChat.id);
      setShowNewChatModal(false);
      return;
    }

    setIsCreatingChat(true);
    try {
      const payload = {
        topic: "Konsultasi Baru",
        doctor_id: doctor.id,
        consultation_date: new Date().toISOString().split("T")[0],
        consultation_time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      const res = await axiosClient.post("/consultations", payload);

      if (res.status === 201) {
        const newId = res.data.data.id;
        await fetchConsultationData(true); 
        setActiveConsultationId(newId);
        setMessages([]); 
        setShowNewChatModal(false);
      }
    } catch (err) {
      console.error("Gagal membuat sesi:", err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (!activeConsultationId) {
        handleOpenNewChatModal();
        return;
    }

    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", message: chatMessage, name: "Saya", avatar: currentUser?.photo_url || null },
    ]);
    const msgToSend = chatMessage;
    setChatMessage("");

    try {
      await axiosClient.post(`/consultations/${activeConsultationId}/reply`, {
        message: msgToSend,
        sender: "patient",
      });
      fetchConsultationData(true);
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinVideo = (link) => {
    if (link) window.open(link, "_blank");
  };

  // --- HANDLER EMAIL ---
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.question) return;

    setEmailStatus("sending");
    
    // Simulasi kirim email
    setTimeout(() => {
        setEmailStatus("success");
        setEmailForm({ email: "", question: "" });
        setTimeout(() => setEmailStatus(null), 3000); // Reset status
    }, 1500);
  };


  const filteredDoctors = availableDoctors.filter((d) =>
    d.name.toLowerCase().includes(searchDoctorTerm.toLowerCase())
  );
  const activeSessionData = chatSessions.find((c) => c.id === activeConsultationId);

  return (
    <div className="konsultasi-page">
      <Header showUserProfile={isLoggedIn} />

      <div className="konsultasi-container">
        {/* Hero Section */}
        <div className="hero-section">
          <img src="/images/Konsultasi.jpg" alt="Konsultasi" className="hero-image" />
          <div className="hero-overlay">
            <h1>Layanan Konsultasi Kesehatan</h1>
            <p>Dapatkan jawaban medis terpercaya langsung dari dokter ahli kami.</p>
          </div>
        </div>

        <div className="consultation-content">
          {/* BAGIAN KIRI: Chat & Video */}
          <div className="left-section">
            
            {/* Live Chat Component */}
            <div className="chat-section">
              <div className="section-header">
                <FaUserMd className="section-icon" />
                <h2>Live Chat dengan Dokter</h2>
              </div>

              {isLoggedIn ? (
                <div className="chat-interface-container">
                  {/* Sidebar: List Chat */}
                  <div className="chat-sidebar">
                    <div className="sidebar-header">
                      <h4>Percakapan</h4>
                      <button className="new-chat-icon-btn" onClick={handleOpenNewChatModal} title="Mulai Baru">
                        <FaPlus />
                      </button>
                    </div>
                    <div className="chat-list-scroll">
                      {chatSessions.length > 0 ? (
                        chatSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`chat-list-item ${activeConsultationId === session.id ? "active" : ""}`}
                            onClick={() => handleSelectChat(session.id)}
                          >
                            <div className="chat-item-avatar">
                              {session.avatar ? (
                                <img src={session.avatar} alt="Doc" onError={(e) => (e.target.style.display = 'none')} />
                              ) : (
                                <div className="avatar-initial">{session.doctorName.charAt(0)}</div>
                              )}
                              <div className="online-status"></div>
                            </div>
                            <div className="chat-item-info">
                              <h5>{session.doctorName}</h5>
                              <p>{session.lastMessage}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-chat-list">
                          <p>Belum ada percakapan.</p>
                          <button className="btn-start-chat" onClick={handleOpenNewChatModal}>
                            + Mulai Konsultasi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Window: Isi Chat */}
                  <div className="chat-window">
                    {activeSessionData ? (
                      <div className="chat-window-header">
                        <div className="header-details">
                          {activeSessionData.avatar ? (
                            <img src={activeSessionData.avatar} alt="Doc" onError={(e) => (e.target.style.display = 'none')} />
                          ) : (
                            <div className="avatar-initial header">{activeSessionData.doctorName.charAt(0)}</div>
                          )}
                          <div>
                            <h4>{activeSessionData.doctorName}</h4>
                            <span>{activeSessionData.topic}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="chat-window-header empty">
                        <h4>Pilih dokter untuk memulai chat</h4>
                      </div>
                    )}

                    <div className="chat-messages-area">
                      {messages.length > 0 ? (
                        messages.map((msg, index) => (
                          <div key={index} className={`chat-bubble ${msg.sender}`}>
                            {msg.avatar ? (
                                <div className="bubble-avatar">
                                    <img src={msg.avatar} alt="Sender" onError={(e) => (e.target.style.display = 'none')} />
                                </div>
                            ) : (
                                <div className="bubble-avatar-placeholder">
                                    {msg.sender === 'user' ? <FaUser /> : <FaUserMd />}
                                </div>
                            )}
                            
                            <div className="bubble-content">
                              <p>{msg.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-chat-placeholder">
                          <FaPaperPlane className="placeholder-icon" />
                          <p>Sapa dokter untuk memulai konsultasi!</p>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleChatSubmit}>
                      <input
                        type="text"
                        placeholder="Ketik pertanyaan Anda..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={isSending}
                      />
                      <button type="submit" disabled={isSending}>
                        <FaPaperPlane />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="login-prompt">
                  <p>
                    Silakan <Link to="/login-pengguna" className="login-link">Login</Link> untuk memulai chat dengan dokter.
                  </p>
                </div>
              )}
            </div>

            {/* Video Sessions */}
            <div className="video-session-section">
              <div className="section-header">
                <FaVideo className="section-icon" />
                <h2>Jadwal Konsultasi Video</h2>
              </div>
              <div className="video-sessions-list">
                {videoSessions.length > 0 ? (
                  videoSessions.map((session) => (
                    <div key={session.id} className="video-session-card">
                      <div className="session-info">
                        <div className="session-avatar">
                          {session.avatar ? (
                            <img src={session.avatar} alt="Doc" onError={(e) => (e.target.src = "/images/default-doc.png")} />
                          ) : (
                            <div className="avatar-initial">{session.doctor.charAt(0)}</div>
                          )}
                        </div>
                        <div className="session-details">
                          <div className="doctor-name">{session.doctor}</div>
                          <div className="session-topic">{session.topic}</div>
                          <div className="session-time">
                            📅 {session.date} • ⏰ {session.time}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`session-btn ${session.status}`}
                        disabled={session.status === "full"}
                        onClick={() => handleJoinVideo(session.link)}
                      >
                        {session.status === "available" ? "Gabung" : "Selesai"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">Belum ada jadwal sesi video.</p>
                )}
              </div>
            </div>
          </div>

          {/* BAGIAN KANAN: FAQ & Email */}
          <div className="right-section">
            <div className="faq-section">
              <div className="section-header">
                <FaQuestionCircle className="section-icon" />
                <h2>FAQ</h2>
              </div>
              <div className="faq-list">
                {faqs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div className="faq-question">{faq.question}</div>
                    <div className="faq-answer">{faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Consultation Widget (UPDATED) */}
            <div className="email-consultation">
              <div className="section-header">
                <FaEnvelope className="section-icon" />
                <h2>Konsultasi via Email</h2>
              </div>
              <div className="email-info-box">
                <p>Tidak punya waktu live chat? Kirimkan pertanyaan Anda, tim medis kami akan membalas via email.</p>
                <span className="response-time">⏱️ Respon: 30-60 menit (Jam Kerja)</span>
              </div>
              
              <form className="email-form" onSubmit={handleEmailSubmit}>
                <div className="ec-form-group">
                    <input
                    type="email"
                    placeholder="Email Anda (contoh@email.com)"
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    className="email-input"
                    required
                    />
                </div>
                <div className="ec-form-group">
                    <textarea
                    placeholder="Tuliskan pertanyaan atau keluhan Anda..."
                    value={emailForm.question}
                    onChange={(e) => setEmailForm({ ...emailForm, question: e.target.value })}
                    className="question-textarea"
                    rows="4"
                    required
                    ></textarea>
                </div>
                
                <button 
                    type="submit" 
                    className={`submit-email-btn ${emailStatus}`}
                    disabled={emailStatus === 'sending'}
                >
                    {emailStatus === 'sending' ? 'Mengirim...' : 
                     emailStatus === 'success' ? 'Terikirim! ✅' : 
                     'Kirim Pertanyaan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PILIH DOKTER BARU --- */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-box select-doctor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mulai Konsultasi Baru</h3>
              <button className="close-icon" onClick={() => setShowNewChatModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="search-doctor-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama dokter atau spesialis..."
                value={searchDoctorTerm}
                onChange={(e) => setSearchDoctorTerm(e.target.value)}
              />
            </div>

            <div className="available-doctors-list">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="doctor-card-item">
                    <div className="doc-card-avatar">
                      {doc.photo_url ? (
                        <img src={doc.photo_url} alt="Doc" onError={(e) => (e.target.style.display = 'none')} />
                      ) : (
                        <div className="avatar-initial">{doc.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="doc-card-info" onClick={() => startNewChat(doc)}>
                      <h4>{doc.name}</h4>
                      <p>{doc.specialization || "Dokter Umum"}</p>
                      <span className="rs-badge">{doc.hospital || "RS Mitra"}</span>
                    </div>
                    <button
                      className="select-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startNewChat(doc);
                      }}
                      disabled={isCreatingChat}
                    >
                      {isCreatingChat ? "Memuat..." : "Chat"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-doc">Tidak ada dokter ditemukan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonsultasiPage;