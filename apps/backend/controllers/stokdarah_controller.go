package controllers

import (
	"net/http"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

// GET /stok-darah - Lihat semua stok
func GetStokDarah(c *gin.Context) {
	var stok []models.StokDarah

	// Preload Admin agar tahu siapa yang terakhir update
	if err := database.DB.Preload("Admin").Find(&stok).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stok})
}

// GET /stok-darah/:id - Lihat detail satu stok
func GetStokDarahByID(c *gin.Context) {
	id := c.Param("id")
	var stok models.StokDarah

	// Cari data berdasarkan ID
	if err := database.DB.Preload("Admin").First(&stok, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data stok darah tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stok})
}

// POST /stok-darah - Tambah/Update stok (Admin)
// Fungsi ini melakukan UPSERT (Update jika ada, Insert jika belum ada) berdasarkan Golongan Darah & Rhesus
func UpdateStokDarah(c *gin.Context) {
	var input models.StokDarah
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// --- LOGIKA MENGAMBIL ADMIN ID DARI TOKEN ---
	// Default ID 1 jika middleware belum terpasang/testing
	var adminID uint = 1
	if v, exists := c.Get("userID"); exists {
		adminID = v.(uint)
	}

	// Cek apakah data stok untuk Golongan & Rhesus ini sudah ada?
	var existingStok models.StokDarah
	if err := database.DB.Where("gol_darah = ? AND rhesus = ?", input.GolDarah, input.Rhesus).First(&existingStok).Error; err == nil {
		// KASUS UPDATE: Jika sudah ada, update jumlah, ketersediaan, waktu, dan admin
		existingStok.JumlahKantong = input.JumlahKantong
		existingStok.Ketersediaan = input.Ketersediaan
		existingStok.WaktuPembaruan = input.WaktuPembaruan
		existingStok.AdminID = adminID // Update admin yang mengubah saat ini

		if err := database.DB.Save(&existingStok).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate stok darah"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Stok darah berhasil diperbarui", "data": existingStok})
	} else {
		// KASUS BARU: Jika belum ada, set AdminID dan buat baru
		input.AdminID = adminID
		if err := database.DB.Create(&input).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat stok darah"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Stok darah baru berhasil ditambahkan", "data": input})
	}
}

// DELETE /stok-darah/:id - Hapus stok (Admin)
// Fungsi baru untuk menghapus stok darah berdasarkan ID
func DeleteStokDarah(c *gin.Context) {
	id := c.Param("id")
	var stok models.StokDarah

	// 1. Cari data dulu untuk memastikan data ada
	if err := database.DB.First(&stok, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data stok darah tidak ditemukan"})
		return
	}

	// 2. Hapus data
	if err := database.DB.Delete(&stok).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus stok darah"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stok darah berhasil dihapus"})
}