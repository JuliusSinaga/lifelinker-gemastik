package models

import (
	"gorm.io/gorm"
	"time"
)

type StokDarah struct {
	gorm.Model
	// Tambahkan `uniqueIndex` agar kombinasi Golongan + Rhesus bersifat UNIK.
	// Artinya: Hanya boleh ada SATU baris data untuk "A" dan "+".
	GolDarah       string    `gorm:"size:5;not null;uniqueIndex:idx_gol_rhesus" json:"gol_darah"` 
	Rhesus         string    `gorm:"size:5;not null;uniqueIndex:idx_gol_rhesus" json:"rhesus"`
	
	Ketersediaan   string    `gorm:"size:20" json:"ketersediaan"` // Aman, Kurang, Kritis
	JumlahKantong  int       `json:"jumlah_kantong"`
	WaktuPembaruan time.Time `json:"waktu_pembaruan"`

	// Foreign Key: Admin yang melakukan update terakhir
	AdminID uint `json:"admin_id"`
	Admin   User `gorm:"foreignKey:AdminID" json:"admin"`
}