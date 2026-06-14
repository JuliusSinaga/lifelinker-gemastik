package main

import (
        "fmt"
        "log"
        "net/http"
        "os"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
        "github.com/joho/godotenv"

        "github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
        "github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
        "github.com/JuliusSinaga/LifeLinker-PPW11/backend/routes"
)

func main() {
        // Load Env
        if err := godotenv.Load(); err != nil {
                log.Println("Peringatan: Tidak dapat memuat file .env, menggunakan environment system jika ada.")
        }

        // Connect Database
        database.ConnectDB()

		// Initialize Firebase for FCM Push Notifications
		controllers.InitFirebase()

        // Auto Migration DINONAKTIFKAN di production
        // Alasan: AutoMigrate di Supabase pooler (port 6543) menyebabkan query information_schema
        // hang 150-265 detik dan membuat Leapcell timeout.
        // Jalankan migrasi manual sekali via: RUN_MIGRATION=true DB_PORT=5432 go run main.go
        if os.Getenv("RUN_MIGRATION") == "true" {
                log.Println("Menjalankan AutoMigrate...")
                if err := database.DB.AutoMigrate(
                        &models.User{},
                        &models.Lokasi{},
                        &models.StokDarah{},
                        &models.Event{},
                        &models.DonationHistory{},
                        &models.Consultation{},
                        &models.Message{},
                        &models.AppSetting{},
                        &models.Education{}, // [BARU] Modul Edukasi
                ); err != nil {
                        log.Printf("Peringatan migrasi: %v", err)
                } else {
                        fmt.Println("✅ Migrasi Database Berhasil")
                }
        } else {
                fmt.Println("⏭️  AutoMigrate dilewati (set RUN_MIGRATION=true untuk migrasi manual)")
        }

        // Jalankan Seeder (Mengisi Data Awal)
        // database.SeedAll(database.DB)

        // --- SETUP FOLDER UPLOAD ---
        uploadDir := "./public/uploads"
        if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
                if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
                        log.Fatal("Gagal membuat folder upload:", err)
                }
                fmt.Println("✅ Folder upload berhasil dibuat:", uploadDir)
        }

        // Init Router
        router := gin.Default()

        // HEALTHCHECK CEPAT untuk Leapcell - harus sebelum middleware berat
        router.GET("/healthz", func(c *gin.Context) {
                c.String(http.StatusOK, "ok")
        })

        // Konfigurasi ini mengizinkan frontend (React) mengakses backend
        router.Use(cors.New(cors.Config{
                AllowAllOrigins:  true, // Saat development aman, saat production sebaiknya spesifik domain
                AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
                AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
                ExposeHeaders:    []string{"Content-Length"},
                AllowCredentials: true,
        }))

        router.Static("/uploads", "./public/uploads")

        // Setup Routes (Mendaftarkan semua endpoint controller)
        routes.SetupRoutes(router)

        // Test Route Sederhana (Health Check)
        router.GET("/", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                        "message": "Server LifeLinker Berjalan 🚀",
                        "status":  "active",
                })
        })
        router.GET("/kaithheathcheck", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                        "message": "Server LifeLinker Berjalan 🚀",
                        "status":  "active",
                })
        })

        // 9. Run Server
        port := os.Getenv("PORT")
        if port == "" {
                port = "8080"
        }
        fmt.Println("✅ Server berjalan di Port:" + port)

        if err := router.Run(":" + port); err != nil {
                log.Fatal("Gagal menjalankan server:", err)
        }
}