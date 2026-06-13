package models

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	// Kita definisikan ID manual agar urutan field rapi di JSON
	ID uint `gorm:"primaryKey" json:"id"`

	// --- DATA EVENT (Sesuai Kolom Database) ---
	// Tag gorm:"column:..." memastikan GORM membaca kolom yang benar di PostgreSQL
	NamaEvent      string    `gorm:"column:nama_event" json:"title"`
	DeskripsiEvent string    `gorm:"column:deskripsi_event" json:"description"`
	TanggalEvent   time.Time `gorm:"column:tanggal_event" json:"date"`
	GambarEvent    string    `gorm:"column:gambar_event" json:"image"`

	Status string `json:"status"`
	Kuota  int    `json:"quota"`

	// --- RELASI (Foreign Keys) ---

	// Lokasi (Wajib)
	LokasiID uint   `gorm:"not null" json:"lokasi_id"`
	Lokasi   Lokasi `gorm:"foreignKey:LokasiID" json:"lokasi"`

	// Organizer (User - Wajib)
	OrganizerID uint `gorm:"not null" json:"organizer_id"`
	Organizer   User `gorm:"foreignKey:OrganizerID" json:"organizer"`

	// --- RELASI PESERTA ---
	// Menggunakan []EventParticipant (Has Many) menggantikan Many2Many langsung
	// Ini memperbaiki error dan memungkinkan akses field tambahan (seperti status pendaftaran)
	Participants []EventParticipant `gorm:"foreignKey:EventID" json:"participants,omitempty"`

	// --- TIMESTAMPS ---
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}