package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var fcmClient *messaging.Client

// InitFirebase inisialisasi Firebase Admin SDK saat server berjalan
func InitFirebase() {
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Println("WARNING: Gagal inisialisasi Firebase App. Fitur notifikasi tidak akan berjalan secara riil (Simulasi Aktif). Error:", err)
		return
	}

	client, err := app.Messaging(context.Background())
	if err != nil {
		log.Println("WARNING: Gagal inisialisasi FCM Client:", err)
		return
	}

	fcmClient = client
	log.Println("Firebase Cloud Messaging (FCM) berhasil diinisialisasi.")
}

type NotificationRequest struct {
	LokasiID  uint   `json:"lokasi_id"`
	BloodType string `json:"blood_type"`
	Rhesus    string `json:"rhesus"`
	Message   string `json:"message"`
}

// SendUrgentNotification menyeleksi pendonor dalam radius dan mengirimkan Push Notification
func SendUrgentNotification(c *gin.Context) {
	var req NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	var lokasi models.Lokasi
	if err := database.DB.First(&lokasi, req.LokasiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lokasi tidak ditemukan"})
		return
	}

	var users []models.User
	if err := database.DB.Preload("Donations").Where("role = ? AND status = ?", "user", "active").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	var targetTokens []string
	var targetNames []string

	now := time.Now()

	for _, u := range users {
		// 1. Filter Darah
		if u.GolDarah != req.BloodType || u.Rhesus != req.Rhesus {
			continue
		}

		// 2. Filter Riwayat (Syarat Medis)
		canDonate := true
		for _, donation := range u.Donations {
			if donation.Status == "Selesai" {
				parsedDate, _ := time.Parse("2006-01-02", donation.TanggalDonasi)
				daysSince := now.Sub(parsedDate).Hours() / 24
				if daysSince < 90 {
					canDonate = false
					break
				}
			}
		}

		if !canDonate {
			continue
		}

		// 3. Filter Jarak (Radius <= 50km)
		userLat, userLng := getCityCoordinates(u.Kota)
		dist := haversine(lokasi.Latitude, lokasi.Longitude, userLat, userLng)

		if dist <= 50 {
			targetNames = append(targetNames, u.Nama)
			if u.FCMToken != "" {
				targetTokens = append(targetTokens, u.FCMToken)
			}
		}
	}

	if len(targetTokens) == 0 {
		// SIMULASI PROTOTYPE: Tidak ada token nyata, kita log saja siapa yang seharusnya menerima
		log.Printf("[SIMULASI FCM] Notifikasi Darurat: '%s'. Target Kandidat %d Orang: %v", req.Message, len(targetNames), targetNames)
		c.JSON(http.StatusOK, gin.H{
			"message": "Simulasi notifikasi berhasil dijalankan (Tidak ada token FCM aktif ditemukan).",
			"targets": targetNames,
		})
		return
	}

	// JIKA FCM CLIENT AKTIF & ADA TOKEN
	if fcmClient != nil {
		message := &messaging.MulticastMessage{
			Notification: &messaging.Notification{
				Title: fmt.Sprintf("Darurat: Dibutuhkan Darah %s%s Segera!", req.BloodType, req.Rhesus),
				Body:  req.Message,
			},
			Data: map[string]string{
				"lokasi_id": fmt.Sprintf("%d", lokasi.ID),
			},
			Tokens: targetTokens,
		}

		br, err := fcmClient.SendEachForMulticast(context.Background(), message)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim notifikasi FCM"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Notifikasi berhasil dikirim via FCM",
			"success_count": br.SuccessCount,
			"targets": targetNames,
		})
		return
	}

	// Fallback jika belum ada credential
	log.Printf("[SIMULASI FCM] Notifikasi Darurat: '%s'. Target Kandidat %d Orang: %v", req.Message, len(targetNames), targetNames)
	c.JSON(http.StatusOK, gin.H{
		"message": "Firebase Credential belum dikonfigurasi. Simulasi dijalankan.",
		"targets": targetNames,
	})
}
