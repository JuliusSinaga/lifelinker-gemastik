package models

import (
	"gorm.io/gorm"
	"time"
)

type DonationHistory struct {
	gorm.Model
	
	// --- RELASI UTAMA ---
	
	// User (Pendonor) - Wajib ada
	UserID uint `gorm:"not null" json:"user_id"`
	User   User `gorm:"foreignKey:UserID" json:"user"`

	// Dokter (Pemeriksa) - OPSIONAL (Pointer)
	// Agar bisa kosong saat user mendaftar sendiri secara online
	DoctorID *uint `json:"doctor_id"` 
	Doctor   *User `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`

	// Lokasi Donor (Rumah Sakit / Unit) - Wajib ada
	LokasiID uint   `json:"lokasi_id"`
	Lokasi   Lokasi `gorm:"foreignKey:LokasiID" json:"lokasi"`

	// --- DATA DONOR ---

	DonationDate    time.Time `gorm:"not null" json:"donation_date"`
	BloodType       string    `gorm:"size:5;not null" json:"blood_type"` // A, B, AB, O
	
	// QuantityDonated - OPSIONAL (Pointer)
	// Kosong saat pendaftaran, diisi saat selesai donor
	QuantityDonated *int      `json:"quantity_donated"` // Dalam ml (cth: 350)

	// --- DATA MEDIS (SNAPSHOT) ---
	Hemoglobin    float64 `json:"hemoglobin"`     // cth: 14.2
	BloodPressure string  `json:"blood_pressure"` // cth: "120/80"
	
	// --- STATUS & CATATAN ---

	// Status: "Pending", "Approved", "Rejected"
	Status string `gorm:"default:'Pending';size:20" json:"status"`
	
	// Catatan: Alasan penolakan, saran kesehatan, atau info tambahan (seperti No HP)
	Notes  string `gorm:"type:text" json:"notes"` 
}