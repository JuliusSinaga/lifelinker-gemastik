package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
)

// GET /lokasi - Ambil semua lokasi
func GetLokasi(c *gin.Context) {
	var lokasi []models.Lokasi
	
	// Kita bisa tambahkan order by nama agar rapi
	if err := database.DB.Order("nama_lokasi asc").Find(&lokasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": lokasi})
}

// GET /lokasi/:id - Ambil satu lokasi detail (PENTING UNTUK DETAIL PAGE)
func GetLokasiByID(c *gin.Context) {
	id := c.Param("id")
	var lokasi models.Lokasi

	// Cari berdasarkan ID
	if err := database.DB.First(&lokasi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lokasi tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": lokasi})
}

// POST /lokasi - Tambah lokasi baru
func CreateLokasi(c *gin.Context) {
	var input models.Lokasi
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah lokasi"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Lokasi berhasil ditambahkan", "data": input})
}

// PUT /lokasi/:id - Update data lokasi (Optional: Untuk Admin nanti)
func UpdateLokasi(c *gin.Context) {
	id := c.Param("id")
	var lokasi models.Lokasi

	// Cek apakah data ada
	if err := database.DB.First(&lokasi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lokasi tidak ditemukan"})
		return
	}

	// Bind data baru
	var input models.Lokasi
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update field
	if err := database.DB.Model(&lokasi).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update lokasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lokasi berhasil diupdate", "data": lokasi})
}

// DELETE /lokasi/:id - Hapus lokasi (Optional: Untuk Admin nanti)
func DeleteLokasi(c *gin.Context) {
	id := c.Param("id")
	var lokasi models.Lokasi

	if err := database.DB.First(&lokasi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lokasi tidak ditemukan"})
		return
	}

	database.DB.Delete(&lokasi)
	c.JSON(http.StatusOK, gin.H{"message": "Lokasi berhasil dihapus"})
}