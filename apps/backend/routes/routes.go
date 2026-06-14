package routes

import (
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/controllers"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// --- PUBLIC ROUTES ---
	public := router.Group("/")
	{
		// Authentication & Registration
		public.POST("/users", controllers.CreateUser)          // Register
		public.POST("/login", controllers.Login)               // Login
		public.POST("/login/google", controllers.GoogleLogin)  // Login Google
		public.POST("/forgot-password", controllers.ForgotPassword)
		public.POST("/reset-password", controllers.ResetPassword)

		// Public Data
		public.GET("/lokasi", controllers.GetLokasi)
		public.GET("/lokasi/:id", controllers.GetLokasiByID)
		public.GET("/stok-darah", controllers.GetStokDarah)
		public.GET("/stok-darah/:id", controllers.GetStokDarahByID)
		public.GET("/events", controllers.GetEvents)
		public.GET("/events/:id", controllers.GetEventByID)
		public.GET("/landing-stats", controllers.GetLandingStats)
		public.GET("/education", controllers.GetEducation)
	}

	// --- PROTECTED ROUTES (Require Authentication) ---
	protected := router.Group("/")
	protected.Use(middleware.RequireAuth())
	{
		// User Profile Management
		protected.PUT("/users/:id", controllers.UpdateUser)       
		protected.PUT("/users/:id/password", controllers.UpdatePassword)
		protected.POST("/users/:id/avatar", controllers.UploadUserAvatar)

		// Donations
		protected.GET("/donations", controllers.GetDonations)
		protected.GET("/donations/:id", controllers.GetDonationByID)
		protected.POST("/donations", controllers.CreateDonation)
		protected.PUT("/donations/:id", controllers.UpdateDonation)

		protected.GET("/stok-darah/prediksi", controllers.GetStokPrediction) // [BARU] Prediksi AI

		// Consultations
		protected.GET("/consultations", controllers.GetConsultations)
		protected.GET("/consultations/:id", controllers.GetConsultationByID) 
		protected.POST("/consultations", controllers.CreateConsultation)
		protected.POST("/consultations/:id/reply", controllers.ReplyConsultation)       
		protected.PUT("/consultations/:id/status", controllers.UpdateConsultationStatus) 
	}

	// --- ADMIN ONLY ROUTES ---
	adminRoutes := router.Group("/")
	adminRoutes.Use(middleware.RequireAuth(), middleware.RequireRole("admin"))
	{
		adminRoutes.GET("/dashboard/admin", controllers.DashboardAdmin)
		adminRoutes.GET("/users", controllers.GetUsers)
		adminRoutes.DELETE("/users/:id", controllers.DeleteUser)
		adminRoutes.PUT("/users/:id/verify", controllers.VerifyDoctor)
		
		adminRoutes.PUT("/admin/landing-stats", controllers.UpdateLandingStats)
	}

	// --- STAFF ROUTES (Admin & Doctor) ---
	staffRoutes := router.Group("/")
	staffRoutes.Use(middleware.RequireAuth(), middleware.RequireRole("admin", "doctor"))
	{
		staffRoutes.POST("/lokasi", controllers.CreateLokasi)
		staffRoutes.PUT("/lokasi/:id", controllers.UpdateLokasi)
		staffRoutes.DELETE("/lokasi/:id", controllers.DeleteLokasi)

		staffRoutes.POST("/stok-darah", controllers.UpdateStokDarah)
		staffRoutes.DELETE("/stok-darah/:id", controllers.DeleteStokDarah)
		staffRoutes.GET("/stok-darah/matching", controllers.GetSmartMatching) 
		staffRoutes.POST("/notifications/send", controllers.SendUrgentNotification) // [BARU] Notifikasi FCM

		staffRoutes.POST("/events", controllers.CreateEvent)
		staffRoutes.PUT("/events/:id", controllers.UpdateEvent)
		staffRoutes.DELETE("/events/:id", controllers.DeleteEvent)

		staffRoutes.POST("/education", controllers.CreateEducation)
		staffRoutes.PUT("/education/:id", controllers.UpdateEducation)
		staffRoutes.DELETE("/education/:id", controllers.DeleteEducation)
	}
}