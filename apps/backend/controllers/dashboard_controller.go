package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
)

// GET /dashboard/admin
func DashboardAdmin(c *gin.Context) {
	// 1. Hitung Jumlah Data dari Database (Real-time)
	var userCount, doctorCount, eventCount, stockCount int64

	// Hitung User (Role: user)
	database.DB.Model(&models.User{}).Where("role = ?", "user").Count(&userCount)

	// Hitung Dokter (Role: dokter)
	database.DB.Model(&models.User{}).Where("role = ?", "dokter").Count(&doctorCount)

	// Hitung Event Aktif
	database.DB.Model(&models.Event{}).Count(&eventCount)

	// Hitung Total Kantong Darah
	// (Menggunakan Select Sum jika ingin total kantong, atau Count jika total baris)
	type Result struct {
		Total int64
	}
	var res Result
	// Menggunakan Coalesce agar jika null (tabel kosong) mengembalikan 0
	database.DB.Model(&models.StokDarah{}).Select("coalesce(sum(jumlah_kantong), 0) as total").Scan(&res)
	stockCount = res.Total

	// 2. Ambil Detail Stok Darah per Golongan
	var stokDetails []models.StokDarah
	database.DB.Find(&stokDetails)

	// 3. Ambil Event Terbaru (Limit 3)
	var recentEvents []models.Event
	// Preload Lokasi agar nama lokasi muncul
	database.DB.Preload("Lokasi").Order("tanggal_event desc").Limit(3).Find(&recentEvents)

	// 4. Kirim Response JSON ke Frontend React
	c.JSON(http.StatusOK, gin.H{
		"message": "Data dashboard berhasil diambil",
		"data": gin.H{
			"user_count":   userCount,
			"doctor_count": doctorCount,
			"donor_count":  userCount, // Asumsi sementara: semua user adalah calon donor
			"event_count":  eventCount,
			"stock_count":  stockCount,
			"blood_stock":  stokDetails,
			"events":       recentEvents,
			// Notifikasi bisa dibuat dummy dulu atau ambil dari tabel notifikasi jika ada
			"notifications": []gin.H{
				{"title": "Stok Darah Menipis", "message": "Segera perbarui data stok darah mingguan", "type": "red"},
				{"title": "Event Baru", "message": "Event di Balige butuh persetujuan", "type": "blue"},
			},
		},
	})
}