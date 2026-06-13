package models

import "gorm.io/gorm"

type Lokasi struct {
	gorm.Model
	// Tambahkan `not null` agar data tidak kosong di database
	NamaLokasi           string `gorm:"not null" json:"nama_lokasi"`
	AlamatLokasi         string `gorm:"not null" json:"alamat_lokasi"`
	
	KontakLokasi         string `json:"kontak_lokasi"`
	JamOperasionalLokasi string `json:"jam_operasional_lokasi"`
	GambarLokasi         string `json:"gambar_lokasi"`

	// --- [BARU] FIELD KUOTA & PENDAFTAR ---
	// Field ini penting agar "Status Pendaftaran" di Frontend terhubung ke Database
	JumlahPendaftar int `json:"jumlah_pendaftar" gorm:"default:0"` // Menyimpan jumlah orang yang sudah daftar
	BatasKuota      int `json:"batas_kuota" gorm:"default:100"`    // Batas maksimal kuota per hari

	// ================= RELASI (UPDATED) =================
	
	// 1. Relasi ke EVENT (One-to-Many)
	// Satu Lokasi bisa menyelenggarakan banyak Event
	Events []Event `gorm:"foreignKey:LokasiID" json:"events,omitempty"`

	// 2. (Opsional Masa Depan) Relasi ke STOK DARAH
	// StokDarah []StokDarah `gorm:"foreignKey:LokasiID" json:"stok_darah,omitempty"`
}