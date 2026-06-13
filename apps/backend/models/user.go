package models

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	// --- Field Umum (User, Dokter, Admin) ---
	Nama     string `json:"name"`
	Email    string `gorm:"unique" json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` 
	Status   string `json:"status" gorm:"default:'active'"`

	NoHp         string `json:"phone"`
	Kota         string `json:"city"`
	TanggalLahir string `json:"birth_date"`
	JenisKelamin string `json:"gender"`
	
	// [PENTING] Tambahan untuk Foto Profil
	PhotoURL     string `json:"photo_url"` 

	// --- Field Khusus User (Pendonor) ---
	GolDarah   string `json:"blood_type"`
	Rhesus     string `json:"rhesus"`
	BeratBadan int    `json:"weight"`

	// --- Field Khusus Dokter ---
	NomorSTR     string `json:"str_number"`
	Spesialisasi string `json:"specialization"`
	Instansi     string `json:"hospital"`

	// --- Reset Password ---
	ResetToken       string    `json:"-"`
	ResetTokenExpiry time.Time `json:"-"`

	// ================= RELASI =================
	Donations              []DonationHistory `gorm:"foreignKey:UserID" json:"donations,omitempty"`
	ConsultationsAsPatient []Consultation    `gorm:"foreignKey:UserID" json:"consultations_as_patient,omitempty"`
	EventsParticipated     []Event           `gorm:"many2many:event_participants;" json:"events_participated,omitempty"`

	DonationsHandled      []DonationHistory `gorm:"foreignKey:DoctorID" json:"donations_handled,omitempty"`
	ConsultationsAsDoctor []Consultation    `gorm:"foreignKey:DoctorID" json:"consultations_as_doctor,omitempty"`
	EventsOrganized       []Event           `gorm:"foreignKey:OrganizerID" json:"events_organized,omitempty"`
	StockUpdates          []StokDarah       `gorm:"foreignKey:AdminID" json:"stock_updates,omitempty"`
}