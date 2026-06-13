package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
)

// GET /events - Ambil semua event
func GetEvents(c *gin.Context) {
	var events []models.Event

	// Preload relasi agar data Lokasi dan Organizer terbawa
	// Preload("Participants") opsional di list view, tapi berguna jika ingin hitung kuota di list
	if err := database.DB.Preload("Lokasi").Preload("Organizer").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": events})
}

// GET /events/:id - Ambil detail 1 event
func GetEventByID(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	// Preload Participants penting untuk menghitung sisa kuota di Frontend
	if err := database.DB.Preload("Lokasi").Preload("Organizer").Preload("Participants").First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": event})
}

// POST /events - Tambah event baru (Admin)
func CreateEvent(c *gin.Context) {
	var input models.Event
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validasi sederhana: Pastikan OrganizerID terisi (biasanya dari token admin yang login)
	// Jika belum ada middleware auth, pastikan dikirim dari body JSON

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Event berhasil dibuat", "data": input})
}

// PUT /events/:id - Update Event (Admin)
func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	// 1. Cek apakah event ada
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// 2. Bind data baru
	var input models.Event
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. Update data
	if err := database.DB.Model(&event).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event berhasil diperbarui", "data": event})
}

// DELETE /events/:id - Hapus Event (Admin)
func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	// 1. Cek keberadaan event
	if err := database.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event tidak ditemukan"})
		return
	}

	// 2. Hapus event
	if err := database.DB.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event berhasil dihapus"})
}