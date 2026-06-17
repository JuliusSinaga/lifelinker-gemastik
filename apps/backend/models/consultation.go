package models

import "gorm.io/gorm"

type Consultation struct {
	gorm.Model
	
	// --- Data Utama Konsultasi ---
	Topic            string `json:"topic"`
	ConsultationDate string `json:"consultation_date"` // Format: YYYY-MM-DD
	ConsultationTime string `json:"consultation_time"` // Format: HH:MM
	Method           string `json:"method" gorm:"default:'chat'"` // 'chat' atau 'video'
	Status           string `json:"status" gorm:"default:'Scheduled'"` // Scheduled, Active, Completed, Cancelled
	
	// --- Integrasi Zoom ---
	ZoomLink      string `json:"zoom_link"`       // URL untuk join meeting (Generate otomatis)
	ZoomMeetingID string `json:"zoom_meeting_id"` // ID unik dari Zoom (untuk manajemen meeting)
	
	// --- Data Tambahan ---
	Recommendation string `json:"recommendation"`  // Kesimpulan/Saran Dokter

	// --- Relasi ke Pasien (User) ---
	// Field ini terhubung dengan User.ConsultationsAsPatient
	UserID uint `json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	// --- Relasi ke Dokter (User) ---
	// Field ini terhubung dengan User.ConsultationsAsDoctor
	DoctorID uint `json:"doctor_id"`
	Doctor   User `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`

	// --- Relasi Chat (One-to-Many) ---
	Messages []Message `gorm:"foreignKey:ConsultationID" json:"messages,omitempty"`
}