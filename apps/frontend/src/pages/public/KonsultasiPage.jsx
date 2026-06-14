import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../styles/KonsultasiPage.css"; 
import Header from "../../components/Header";
import axiosClient from "../../service/axiosClient";
import Icon from "../../components/core/Icon";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Input from "../../components/core/Input";

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

      <div className="konsultasi-container" style={{ backgroundColor: "var(--color-bg-page)" }}>
        {/* Hero Section */}
        <div className="hero-section" style={{ position: "relative", height: "300px", overflow: "hidden", borderRadius: "0 0 var(--radius-large) var(--radius-large)", marginBottom: "40px" }}>
          <img src="/images/Konsultasi.jpg" alt="Konsultasi" className="hero-image" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="hero-overlay" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "white", textAlign: "center", padding: "20px" }}>
            <h1 style={{ fontFamily: "var(--font-family-brand)", fontSize: "2.5rem", marginBottom: "16px" }}>Layanan Konsultasi Kesehatan</h1>
            <p style={{ fontSize: "1.2rem", maxWidth: "600px" }}>Dapatkan jawaban medis terpercaya langsung dari dokter ahli kami.</p>
          </div>
        </div>

        <div className="consultation-content" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", padding: "0 20px 40px", maxWidth: "1200px", margin: "0 auto" }}>
          {/* BAGIAN KIRI: Chat & Video */}
          <div className="left-section" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Live Chat Component */}
            <Card variant="standard" className="chat-section" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "600px" }}>
              <div className="section-header" style={{ padding: "20px", backgroundColor: "var(--color-surface-background)", borderBottom: "1px solid var(--color-border-divider)", display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon icon="mdi:doctor" className="section-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Live Chat dengan Dokter</h2>
              </div>

              {isLoggedIn ? (
                <div className="chat-interface-container" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                  {/* Sidebar: List Chat */}
                  <div className="chat-sidebar" style={{ width: "300px", borderRight: "1px solid var(--color-border-divider)", display: "flex", flexDirection: "column" }}>
                    <div className="sidebar-header" style={{ padding: "16px", borderBottom: "1px solid var(--color-border-divider)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-surface-background)" }}>
                      <h4 style={{ margin: 0 }}>Percakapan</h4>
                      <Button variant="ghost" onClick={handleOpenNewChatModal} title="Mulai Baru" style={{ padding: "8px", borderRadius: "50%" }}>
                        <Icon icon="mdi:plus" />
                      </Button>
                    </div>
                    <div className="chat-list-scroll" style={{ flex: 1, overflowY: "auto" }}>
                      {chatSessions.length > 0 ? (
                        chatSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`chat-list-item ${activeConsultationId === session.id ? "active" : ""}`}
                            onClick={() => handleSelectChat(session.id)}
                            style={{ padding: "16px", borderBottom: "1px solid var(--color-border-divider)", display: "flex", gap: "12px", cursor: "pointer", backgroundColor: activeConsultationId === session.id ? "var(--color-surface-background)" : "transparent", transition: "background-color 0.2s" }}
                          >
                            <div className="chat-item-avatar" style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "bold", overflow: "hidden", flexShrink: 0 }}>
                              {session.avatar ? (
                                <img src={session.avatar} alt="Doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.style.display = 'none')} />
                              ) : (
                                <div className="avatar-initial">{session.doctorName.charAt(0)}</div>
                              )}
                              <div className="online-status" style={{ position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--color-status-success)", border: "2px solid var(--color-surface-card)" }}></div>
                            </div>
                            <div className="chat-item-info" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                              <h5 style={{ margin: "0 0 4px 0", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.doctorName}</h5>
                              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.lastMessage}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-chat-list" style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                          <p style={{ marginBottom: "16px" }}>Belum ada percakapan.</p>
                          <Button variant="primary" onClick={handleOpenNewChatModal}>
                            + Mulai Konsultasi
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Window: Isi Chat */}
                  <div className="chat-window" style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "var(--color-surface-background)" }}>
                    {activeSessionData ? (
                      <div className="chat-window-header" style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border-divider)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="header-details" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", overflow: "hidden" }}>
                            {activeSessionData.avatar ? (
                              <img src={activeSessionData.avatar} alt="Doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.style.display = 'none')} />
                            ) : (
                              <div className="avatar-initial header">{activeSessionData.doctorName.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 4px 0" }}>{activeSessionData.doctorName}</h4>
                            <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{activeSessionData.topic}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="chat-window-header empty" style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border-divider)", backgroundColor: "var(--color-surface-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <h4 style={{ margin: 0, color: "var(--color-text-secondary)" }}>Pilih dokter untuk memulai chat</h4>
                      </div>
                    )}

                    <div className="chat-messages-area" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      {messages.length > 0 ? (
                        messages.map((msg, index) => (
                          <div key={index} className={`chat-bubble ${msg.sender}`} style={{ display: "flex", alignItems: "flex-end", gap: "8px", alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", flexDirection: msg.sender === "user" ? "row-reverse" : "row", maxWidth: "80%" }}>
                            {msg.avatar ? (
                                <div className="bubble-avatar" style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                                    <img src={msg.avatar} alt="Sender" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.style.display = 'none')} />
                                </div>
                            ) : (
                                <div className="bubble-avatar-placeholder" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-border-input)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon icon={msg.sender === 'user' ? "mdi:account" : "mdi:doctor"} />
                                </div>
                            )}
                            
                            <div className="bubble-content" style={{ padding: "12px 16px", borderRadius: "var(--radius-large)", backgroundColor: msg.sender === "user" ? "var(--color-brand-primary)" : "white", color: msg.sender === "user" ? "white" : "var(--color-text-primary)", border: msg.sender !== "user" ? "1px solid var(--color-border-divider)" : "none", borderBottomRightRadius: msg.sender === "user" ? "4px" : "var(--radius-large)", borderBottomLeftRadius: msg.sender !== "user" ? "4px" : "var(--radius-large)" }}>
                              <p style={{ margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>{msg.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-chat-placeholder" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", gap: "16px" }}>
                          <Icon icon="mdi:send" className="placeholder-icon" style={{ fontSize: "48px", color: "var(--color-border-divider)" }} />
                          <p>Sapa dokter untuk memulai konsultasi!</p>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleChatSubmit} style={{ padding: "16px", backgroundColor: "var(--color-surface-card)", borderTop: "1px solid var(--color-border-divider)", display: "flex", gap: "12px" }}>
                      <Input
                        type="text"
                        placeholder="Ketik pertanyaan Anda..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={isSending}
                        style={{ flex: 1 }}
                      />
                      <Button type="submit" variant="primary" disabled={isSending || !chatMessage.trim()} style={{ width: "48px", height: "48px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                        <Icon icon="mdi:send" />
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="login-prompt" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                  <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    Silakan <Link to="/login-pengguna" className="login-link" style={{ color: "var(--color-brand-primary)", fontWeight: "bold", textDecoration: "none" }}>Login</Link> untuk memulai chat dengan dokter.
                  </p>
                </div>
              )}
            </Card>

            {/* Video Sessions */}
            <Card variant="standard" className="video-session-section" style={{ padding: "32px" }}>
              <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <Icon icon="mdi:video" className="section-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Jadwal Konsultasi Video</h2>
              </div>
              <div className="video-sessions-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {videoSessions.length > 0 ? (
                  videoSessions.map((session) => (
                    <div key={session.id} className="video-session-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--color-border-divider)", borderRadius: "var(--radius-standard)", flexWrap: "wrap", gap: "16px" }}>
                      <div className="session-info" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="session-avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", overflow: "hidden", flexShrink: 0 }}>
                          {session.avatar ? (
                            <img src={session.avatar} alt="Doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.src = "/images/default-doc.png")} />
                          ) : (
                            <div className="avatar-initial">{session.doctor.charAt(0)}</div>
                          )}
                        </div>
                        <div className="session-details">
                          <div className="doctor-name" style={{ fontWeight: "bold", marginBottom: "4px" }}>{session.doctor}</div>
                          <div className="session-topic" style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{session.topic}</div>
                          <div className="session-time" style={{ fontSize: "12px", color: "var(--color-brand-primary)", fontWeight: "500" }}>
                            📅 {session.date} • ⏰ {session.time}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={session.status === "available" ? "primary" : "secondary"}
                        className={`session-btn ${session.status}`}
                        disabled={session.status === "full"}
                        onClick={() => handleJoinVideo(session.link)}
                      >
                        {session.status === "available" ? "Gabung" : "Selesai"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="empty-text" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "20px" }}>Belum ada jadwal sesi video.</p>
                )}
              </div>
            </Card>
          </div>

          {/* BAGIAN KANAN: FAQ & Email */}
          <div className="right-section" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Card variant="standard" className="faq-section" style={{ padding: "32px" }}>
              <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <Icon icon="mdi:help-circle" className="section-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>FAQ</h2>
              </div>
              <div className="faq-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {faqs.map((faq) => (
                  <div key={faq.id} className="faq-item" style={{ paddingBottom: "16px", borderBottom: faq.id !== faqs.length ? "1px solid var(--color-border-divider)" : "none" }}>
                    <div className="faq-question" style={{ fontWeight: "bold", marginBottom: "8px" }}>{faq.question}</div>
                    <div className="faq-answer" style={{ color: "var(--color-text-secondary)", lineHeight: 1.5, fontSize: "14px" }}>{faq.answer}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Email Consultation Widget (UPDATED) */}
            <Card variant="standard" className="email-consultation" style={{ padding: "32px" }}>
              <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Icon icon="mdi:email" className="section-icon" style={{ fontSize: "24px", color: "var(--color-brand-primary)" }} />
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Konsultasi via Email</h2>
              </div>
              <div className="email-info-box" style={{ backgroundColor: "var(--color-surface-background)", padding: "16px", borderRadius: "var(--radius-standard)", marginBottom: "24px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                <p style={{ margin: "0 0 8px 0" }}>Tidak punya waktu live chat? Kirimkan pertanyaan Anda, tim medis kami akan membalas via email.</p>
                <span className="response-time" style={{ fontWeight: "bold", color: "var(--color-status-warning)" }}>⏱️ Respon: 30-60 menit (Jam Kerja)</span>
              </div>
              
              <form className="email-form" onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="ec-form-group">
                    <Input
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
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-standard)", border: "1px solid var(--color-border-input)", fontFamily: "inherit", resize: "vertical", minHeight: "100px" }}
                    ></textarea>
                </div>
                
                <Button 
                    type="submit" 
                    variant="primary"
                    className={`submit-email-btn ${emailStatus}`}
                    disabled={emailStatus === 'sending'}
                    fullWidth
                    style={{
                      backgroundColor: emailStatus === 'success' ? 'var(--color-status-success)' : undefined,
                      borderColor: emailStatus === 'success' ? 'var(--color-status-success)' : undefined,
                    }}
                >
                    {emailStatus === 'sending' ? 'Mengirim...' : 
                     emailStatus === 'success' ? 'Terikirim! ✅' : 
                     'Kirim Pertanyaan'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* --- MODAL PILIH DOKTER BARU --- */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="modal-box select-doctor-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "var(--color-surface-card)", width: "100%", maxWidth: "500px", borderRadius: "var(--radius-large)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>
            <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border-divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Mulai Konsultasi Baru</h3>
              <Button variant="ghost" className="close-icon" onClick={() => setShowNewChatModal(false)} style={{ padding: "8px", borderRadius: "50%" }}>
                <Icon icon="mdi:close" />
              </Button>
            </div>

            <div className="search-doctor-container" style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border-divider)" }}>
              <Input
                type="text"
                placeholder="Cari nama dokter atau spesialis..."
                value={searchDoctorTerm}
                onChange={(e) => setSearchDoctorTerm(e.target.value)}
                icon="mdi:magnify"
              />
            </div>

            <div className="available-doctors-list" style={{ overflowY: "auto", padding: "16px 24px" }}>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="doctor-card-item" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0", borderBottom: "1px solid var(--color-border-divider)" }}>
                    <div className="doc-card-avatar" style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", overflow: "hidden", flexShrink: 0 }}>
                      {doc.photo_url ? (
                        <img src={doc.photo_url} alt="Doc" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.style.display = 'none')} />
                      ) : (
                        <div className="avatar-initial">{doc.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="doc-card-info" onClick={() => startNewChat(doc)} style={{ flex: 1, cursor: "pointer" }}>
                      <h4 style={{ margin: "0 0 4px 0" }}>{doc.name}</h4>
                      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--color-text-secondary)" }}>{doc.specialization || "Dokter Umum"}</p>
                      <span className="rs-badge" style={{ fontSize: "12px", padding: "2px 8px", backgroundColor: "var(--color-surface-background)", borderRadius: "12px", border: "1px solid var(--color-border-divider)" }}>{doc.hospital || "RS Mitra"}</span>
                    </div>
                    <Button
                      variant="primary"
                      className="select-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startNewChat(doc);
                      }}
                      disabled={isCreatingChat}
                    >
                      {isCreatingChat ? "Memuat..." : "Chat"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="no-doc" style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "20px" }}>Tidak ada dokter ditemukan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KonsultasiPage;