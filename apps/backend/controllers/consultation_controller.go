package controllers

import (
	"fmt"
	"net/http"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /consultations
// Mengambil daftar konsultasi (Difilter otomatis berdasarkan siapa yang login)
func GetConsultations(c *gin.Context) {
	// 1. AMBIL USER ID DARI CONTEXT (Wajib ada Middleware)
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Silakan login terlebih dahulu"})
		return
	}
	userID := userIDRaw.(uint)

	// 2. Cek Role User di Database (Untuk menentukan filter)
	var currentUser models.User
	if err := database.DB.First(&currentUser, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak valid"})
		return
	}

	var consultations []models.Consultation

	// 3. Siapkan Query Dasar
	query := database.DB.
		Preload("User").
		Preload("Doctor").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		})

	// 4. LOGIKA FILTER BERDASARKAN ROLE
	switch currentUser.Role {
	case "user":
		// Pasien hanya melihat konsultasi miliknya
		query = query.Where("user_id = ?", userID)
	case "dokter":
		// Dokter hanya melihat konsultasi yang masuk ke dia
		query = query.Where("doctor_id = ?", userID)
	case "admin":
		// Admin bisa filter manual lewat query param (opsional)
		if qUser := c.Query("user_id"); qUser != "" {
			query = query.Where("user_id = ?", qUser)
		}
		if qDoc := c.Query("doctor_id"); qDoc != "" {
			query = query.Where("doctor_id = ?", qDoc)
		}
	}

	// 5. Eksekusi Query
	if err := query.Order("created_at desc").Find(&consultations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data konsultasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": consultations})
}

// POST /consultations
// Pasien membuat jadwal konsultasi baru
func CreateConsultation(c *gin.Context) {
	// 1. AMBIL USER ID (Wajib)
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDRaw.(uint)

	var input struct {
		Topic    string `json:"topic" binding:"required"`
		DoctorID uint   `json:"doctor_id" binding:"required"`
		Date     string `json:"consultation_date" binding:"required"`
		Time     string `json:"consultation_time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// --- LOGIC ZOOM ---
	zoomStartTime := fmt.Sprintf("%sT%s:00", input.Date, input.Time)
	zoomLink, zoomMeetingID, errZoom := utils.CreateZoomMeeting("LifeLinker: "+input.Topic, zoomStartTime)
	
	if errZoom != nil {
		fmt.Println("⚠️ Gagal membuat Zoom:", errZoom)
		zoomLink = ""
		zoomMeetingID = ""
	}
	// ------------------

	consultation := models.Consultation{
		Topic:            input.Topic,
		DoctorID:         input.DoctorID,
		UserID:           userID, // Menggunakan ID asli dari token login
		ConsultationDate: input.Date,
		ConsultationTime: input.Time,
		Status:           "Scheduled",
		ZoomLink:         zoomLink,
		ZoomMeetingID:    zoomMeetingID,
	}

	if err := database.DB.Create(&consultation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menjadwalkan konsultasi"})
		return
	}

	msg := "Konsultasi berhasil dijadwalkan"
	if zoomLink == "" {
		msg += " (Link Zoom gagal dibuat otomatis, hubungi admin/dokter)"
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": msg,
		"data":    consultation,
	})
}

// POST /consultations/:id/reply
func ReplyConsultation(c *gin.Context) {
	id := c.Param("id")

	// Pastikan user login
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Message string `json:"message" binding:"required"`
		Sender  string `json:"sender" binding:"required"` // "doctor" / "patient"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Cek Validitas Konsultasi
	var consultation models.Consultation
	if err := database.DB.First(&consultation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konsultasi tidak ditemukan"})
		return
	}

	// Simpan Pesan
	msg := models.Message{
		ConsultationID: consultation.ID,
		Text:           input.Message,
		SenderRole:     input.Sender,
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim pesan"})
		return
	}

	// Update Status jika dokter membalas pertama kali
	if input.Sender == "doctor" && consultation.Status == "Scheduled" {
		consultation.Status = "Active"
		database.DB.Save(&consultation)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Pesan terkirim",
		"data":    msg,
	})
}

// PUT /consultations/:id/status
func UpdateConsultationStatus(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Status      string `json:"status"`
		MeetingLink string `json:"meeting_link"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var consultation models.Consultation
	if err := database.DB.First(&consultation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	if input.Status != "" {
		consultation.Status = input.Status
	}
	if input.MeetingLink != "" {
		consultation.ZoomLink = input.MeetingLink
	}

	if err := database.DB.Save(&consultation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status konsultasi diperbarui",
		"data":    consultation,
	})
}

// GET /consultations/:id
func GetConsultationByID(c *gin.Context) {
	id := c.Param("id")
	var consultation models.Consultation

	if err := database.DB.
		Preload("User").
		Preload("Doctor").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		First(&consultation, id).Error; err != nil {
		
		c.JSON(http.StatusNotFound, gin.H{"error": "Konsultasi tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": consultation})
}