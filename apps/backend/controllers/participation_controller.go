package controllers

import (
	"net/http"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

// POST /participation
func RegisterParticipant(c *gin.Context) {
	// 1. Tangkap Input JSON dari React
	var input struct {
		LokasiID             uint   `json:"lokasi_id"`
		UserID               uint   `json:"user_id"`
		NamaLengkap          string `json:"nama_lengkap"`
		NomorHP              string `json:"nomor_hp"`
		GolonganDarah        string `json:"golongan_darah"`
		RiwayatDonorTerakhir string `json:"tanggal_donor"`
		PilihTanggal         string `json:"pilih_tanggal"`
		PilihJam             string `json:"pilih_jam"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah: " + err.Error()})
		return
	}

	// 2. Cari Event yang aktif di Lokasi tersebut
	var event models.Event
	// Kita cari event berdasarkan lokasi_id
	if err := database.DB.Where("lokasi_id = ?", input.LokasiID).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Belum ada event donor aktif di lokasi ini. Hubungi Admin."})
		return
	}

	// 3. Simpan Data Pendaftar
	partisipan := models.EventParticipant{
		EventID:              event.ID,      // ID Event yang ditemukan otomatis
		UserID:               input.UserID,  // ID User yang login
		NamaLengkap:          input.NamaLengkap,
		NomorHP:              input.NomorHP,
		GolonganDarah:        input.GolonganDarah,
		RiwayatDonorTerakhir: input.RiwayatDonorTerakhir,
		TanggalBooking:       input.PilihTanggal,
		JamBooking:           input.PilihJam,
		Status:               "Pending",
	}

	if err := database.DB.Create(&partisipan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran Berhasil!",
		"data":    partisipan,
	})
}