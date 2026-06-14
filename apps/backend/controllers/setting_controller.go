package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

type LandingStatsPayload struct {
	Mode         string `json:"mode"` // "auto" or "manual"
	DonorCount   int    `json:"donor_count"`
	KantongCount int    `json:"kantong_count"`
	NyawaCount   int    `json:"nyawa_count"`
	EventCount   int    `json:"event_count"`
}

// GetLandingStats mengembalikan data statistik untuk BerandaPage
// GET /landing-stats
func GetLandingStats(c *gin.Context) {
	var setting models.AppSetting
	err := database.DB.Where("key = ?", "landing_stats").First(&setting).Error

	var stats LandingStatsPayload

	// Jika pengaturan belum ada, gunakan default (auto)
	if err != nil {
		stats.Mode = "auto"
	} else {
		json.Unmarshal([]byte(setting.Value), &stats)
	}

	if stats.Mode == "manual" {
		// Jika manual, langsung kembalikan angka dari database (setting)
		c.JSON(http.StatusOK, gin.H{
			"message": "Data landing stats berhasil diambil (manual)",
			"data":    stats,
		})
		return
	}

	// Jika mode "auto" atau tidak ditemukan, hitung dari database secara real-time
	var userCount, eventCount, stockCount int64

	database.DB.Model(&models.User{}).Where("role = ?", "user").Count(&userCount)
	database.DB.Model(&models.Event{}).Count(&eventCount)

	type Result struct {
		Total int64
	}
	var res Result
	database.DB.Model(&models.StokDarah{}).Select("coalesce(sum(jumlah_kantong), 0) as total").Scan(&res)
	stockCount = res.Total

	autoStats := LandingStatsPayload{
		Mode:         "auto",
		DonorCount:   int(userCount),
		KantongCount: int(stockCount),
		EventCount:   int(eventCount),
		NyawaCount:   int(stockCount * 3), // Asumsi 1 kantong menyelamatkan 3 nyawa
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data landing stats berhasil dihitung (auto)",
		"data":    autoStats,
	})
}

// UpdateLandingStats digunakan Admin untuk mengubah pengaturan stats
// PUT /admin/landing-stats
func UpdateLandingStats(c *gin.Context) {
	var payload LandingStatsPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	valueJSON, _ := json.Marshal(payload)

	var setting models.AppSetting
	err := database.DB.Where("key = ?", "landing_stats").First(&setting).Error

	if err != nil {
		// Buat baru jika belum ada
		setting = models.AppSetting{
			Key:   "landing_stats",
			Value: string(valueJSON),
		}
		database.DB.Create(&setting)
	} else {
		// Update yang sudah ada
		setting.Value = string(valueJSON)
		database.DB.Save(&setting)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Pengaturan statistik berhasil disimpan",
		"data":    payload,
	})
}
