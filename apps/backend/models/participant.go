package models

import "time"

type EventParticipant struct {
    ID                   uint      `gorm:"primaryKey" json:"id"`
    EventID              uint      `json:"event_id"`
    UserID               uint      `json:"user_id"`
    NamaLengkap          string    `json:"nama_lengkap"`
    NomorHP              string    `json:"nomor_hp"`
    GolonganDarah        string    `json:"golongan_darah"`
    RiwayatDonorTerakhir string    `json:"tanggal_donor"`
    TanggalBooking       string    `json:"pilih_tanggal"`
    JamBooking           string    `json:"pilih_jam"`
    Status               string    `json:"status" gorm:"default:'Pending'"`
    
    // Wajib ada CreatedAt dan UpdatedAt agar GORM tidak error saat insert
    CreatedAt            time.Time `json:"created_at"`
    UpdatedAt            time.Time `json:"updated_at"`
}