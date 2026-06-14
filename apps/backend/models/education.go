package models

import "gorm.io/gorm"

type Education struct {
	gorm.Model
	Judul    string `gorm:"not null" json:"judul"`
	Konten   string `gorm:"type:text;not null" json:"konten"`
	Kategori string `json:"kategori"` // e.g. "FAQ", "Tips", "Persiapan"
}
