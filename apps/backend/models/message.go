package models

import "gorm.io/gorm"

type Message struct {
	gorm.Model
	ConsultationID uint   `json:"consultation_id"` // Foreign Key
	SenderRole     string `json:"sender_role"`     // "doctor" atau "patient"
	Text           string `json:"text"`            // Isi Pesan
}