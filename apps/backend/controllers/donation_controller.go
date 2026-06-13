package controllers

import (
	"net/http"
	"gorm.io/gorm"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

// GET /donations
// Mengambil daftar donasi (Bisa filter by user_id)
func GetDonations(c *gin.Context) {
	// 1. Ambil parameter user_id dari URL (jika ada)
	userID := c.Query("user_id")
	
	var donations []models.DonationHistory

	// 2. Siapkan query dengan Preload lengkap
	// Preload "Lokasi" penting agar user tahu dia donor di mana
	query := database.DB.
		Preload("User").
		Preload("Doctor").
		Preload("Lokasi")

	// 3. Filter berdasarkan User ID (untuk halaman 'Riwayat Saya')
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// 4. Eksekusi (Urutkan dari yang terbaru)
	if err := query.Order("donation_date desc").Find(&donations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": donations})
}

// GET /donations/:id
func GetDonationByID(c *gin.Context) {
	id := c.Param("id")
	var donation models.DonationHistory

	if err := database.DB.
		Preload("User").
		Preload("Doctor").
		Preload("Lokasi").
		First(&donation, id).Error; err != nil {
		
		c.JSON(http.StatusNotFound, gin.H{"error": "Data donasi tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": donation})
}

// POST /donations - Pendaftaran Donor Baru (User Mandiri / Dokter)
// POST /donations - Pendaftaran Donor Baru
func CreateDonation(c *gin.Context) {
	var input models.DonationHistory
	
	// Bind JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Set Default Status
	if input.Status == "" {
		input.Status = "Pending"
	}

	// 2. Validasi Wajib (User & Lokasi harus ada)
	if input.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID wajib diisi"})
		return
	}
	if input.LokasiID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lokasi ID wajib diisi"})
		return
	}

	// 3. Simpan Pendaftaran ke Database
	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pendaftaran donor"})
		return
	}

	// 4. [PENTING] Update Counter Pendaftar di Tabel Lokasi
	// Ini membuat progress bar "Status Pendaftaran" di Frontend jadi real-time & persisten
	if err := database.DB.Model(&models.Lokasi{}).
		Where("id = ?", input.LokasiID).
		UpdateColumn("jumlah_pendaftar", gorm.Expr("jumlah_pendaftar + ?", 1)).
		Error; err != nil {
		
		// Kita log errornya saja, jangan batalkan response sukses ke user
		// karena pendaftaran utamanya sudah berhasil tersimpan.
		// log.Printf("Gagal update counter lokasi: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran berhasil! Silakan datang ke lokasi sesuai jadwal.",
		"data":    input,
	})
}

// PUT /donations/:id - Update Status/Data (Oleh Dokter/Admin)
// Contoh: Mengubah status 'Pending' -> 'Approved' dan mengisi DoctorID & QuantityDonated
func UpdateDonation(c *gin.Context) {
	id := c.Param("id")
	var donation models.DonationHistory

	// 1. Cari data lama
	if err := database.DB.First(&donation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data donasi tidak ditemukan"})
		return
	}

	// 2. Bind data baru
	var input models.DonationHistory
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. Update field
	// GORM Updates akan mengupdate field yang dikirim (non-zero value)
	if err := database.DB.Model(&donation).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update data donasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data donasi berhasil diperbarui",
		"data":    donation,
	})
}