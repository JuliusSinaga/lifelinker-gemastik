package controllers

import (
	"net/http"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

// GetEducation mendapatkan semua modul edukasi & FAQ
func GetEducation(c *gin.Context) {
	var education []models.Education
	
	// Fitur cari/filter berdasarkan kategori
	kategori := c.Query("kategori")
	query := database.DB.Model(&models.Education{})
	if kategori != "" && kategori != "Semua" {
		query = query.Where("kategori = ?", kategori)
	}
	
	if err := query.Find(&education).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data edukasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil",
		"data":    education,
	})
}

// CreateEducation membuat modul edukasi baru (Hanya Admin)
func CreateEducation(c *gin.Context) {
	var input struct {
		Judul    string `json:"judul" binding:"required"`
		Konten   string `json:"konten" binding:"required"`
		Kategori string `json:"kategori" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	education := models.Education{
		Judul:    input.Judul,
		Konten:   input.Konten,
		Kategori: input.Kategori,
	}

	if err := database.DB.Create(&education).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat modul edukasi"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Edukasi berhasil dibuat",
		"data":    education,
	})
}

// UpdateEducation memperbarui modul edukasi (Hanya Admin)
func UpdateEducation(c *gin.Context) {
	id := c.Param("id")
	var education models.Education

	if err := database.DB.First(&education, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modul edukasi tidak ditemukan"})
		return
	}

	var input struct {
		Judul    string `json:"judul"`
		Konten   string `json:"konten"`
		Kategori string `json:"kategori"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Judul != "" {
		education.Judul = input.Judul
	}
	if input.Konten != "" {
		education.Konten = input.Konten
	}
	if input.Kategori != "" {
		education.Kategori = input.Kategori
	}

	database.DB.Save(&education)

	c.JSON(http.StatusOK, gin.H{
		"message": "Edukasi berhasil diperbarui",
		"data":    education,
	})
}

// DeleteEducation menghapus modul edukasi (Hanya Admin)
func DeleteEducation(c *gin.Context) {
	id := c.Param("id")
	var education models.Education

	if err := database.DB.First(&education, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modul edukasi tidak ditemukan"})
		return
	}

	database.DB.Delete(&education)

	c.JSON(http.StatusOK, gin.H{
		"message": "Modul edukasi berhasil dihapus",
	})
}
