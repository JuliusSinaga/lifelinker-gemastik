package routes

import (
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/controllers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// --- AUTHENTICATION ---
	router.POST("/users", controllers.CreateUser)          // Register
	router.POST("/login", controllers.Login)               // Login
	router.POST("/login/google", controllers.GoogleLogin)  // Login Google
	
	// Password Management
	router.POST("/forgot-password", controllers.ForgotPassword)
	router.POST("/reset-password", controllers.ResetPassword)

	// --- USER MANAGEMENT & PROFILE ---
	router.GET("/users", controllers.GetUsers)             // List Users (Testing/Admin)
	router.PUT("/users/:id", controllers.UpdateUser)       // [BARU] Update Profil (Nama, Kota, dll)
	router.PUT("/users/:id/password", controllers.UpdatePassword) // Ganti Password
	router.DELETE("/users/:id", controllers.DeleteUser)    // Hapus User (Admin)
	router.PUT("/users/:id/verify", controllers.VerifyDoctor) // Verifikasi Dokter (Admin)
	router.POST("/users/:id/avatar", controllers.UploadUserAvatar) // Upload Foto Profil

	// --- DASHBOARD ADMIN ---
	router.GET("/dashboard/admin", controllers.DashboardAdmin)

	// --- FITUR PUBLIK & UTAMA ---

	// Lokasi Donor
	router.GET("/lokasi", controllers.GetLokasi)
	router.GET("/lokasi/:id", controllers.GetLokasiByID)
	router.POST("/lokasi", controllers.CreateLokasi)
	router.PUT("/lokasi/:id", controllers.UpdateLokasi)
	router.DELETE("/lokasi/:id", controllers.DeleteLokasi)

	// Stok Darah
	router.GET("/stok-darah", controllers.GetStokDarah)
	router.GET("/stok-darah/:id", controllers.GetStokDarahByID)
	router.POST("/stok-darah", controllers.UpdateStokDarah)
	router.DELETE("/stok-darah/:id", controllers.DeleteStokDarah) 

	// Events
	router.GET("/events", controllers.GetEvents)
	router.GET("/events/:id", controllers.GetEventByID)
	router.POST("/events", controllers.CreateEvent)
	router.PUT("/events/:id", controllers.UpdateEvent)
	router.DELETE("/events/:id", controllers.DeleteEvent)

	// Donasi (Riwayat & Pengajuan)
	router.GET("/donations", controllers.GetDonations)
	router.GET("/donations/:id", controllers.GetDonationByID)
	router.POST("/donations", controllers.CreateDonation)
	router.PUT("/donations/:id", controllers.UpdateDonation)

	// Konsultasi (Chat & Video)
	router.GET("/consultations", controllers.GetConsultations)
	router.GET("/consultations/:id", controllers.GetConsultationByID) // [BARU] Detail 1 Konsultasi
	router.POST("/consultations", controllers.CreateConsultation)
	
	// Fitur Chat & Status Video
	router.POST("/consultations/:id/reply", controllers.ReplyConsultation)       // Kirim Pesan
	router.PUT("/consultations/:id/status", controllers.UpdateConsultationStatus) // Update Status / Link Zoom

	// --- PENGATURAN WEB (LANDING PAGE STATS) ---
	router.GET("/landing-stats", controllers.GetLandingStats)
	router.PUT("/admin/landing-stats", controllers.UpdateLandingStats)
}