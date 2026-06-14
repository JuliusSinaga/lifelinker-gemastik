package controllers

import (
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/gin-gonic/gin"
)

// Helper: Haversine distance calculation in kilometers
func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0 // Earth radius in kilometers
	
	lat1Rad := lat1 * math.Pi / 180
	lon1Rad := lon1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lon2Rad := lon2 * math.Pi / 180

	dlat := lat2Rad - lat1Rad
	dlon := lon2Rad - lon1Rad

	a := math.Sin(dlat/2)*math.Sin(dlat/2) + math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dlon/2)*math.Sin(dlon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// Helper: Map city name to approximate coordinates for prototype
func getCityCoordinates(city string) (float64, float64) {
	city = strings.ToLower(strings.TrimSpace(city))
	switch {
	case strings.Contains(city, "medan"):
		return 3.5952, 98.6722
	case strings.Contains(city, "toba") || strings.Contains(city, "balige") || strings.Contains(city, "laguboti"):
		return 2.3333, 99.0667
	case strings.Contains(city, "siantar") || strings.Contains(city, "pematangsiantar"):
		return 2.9600, 99.0689
	case strings.Contains(city, "binjai"):
		return 3.6019, 98.4842
	default:
		// Default to a central point in North Sumatra if city is unknown
		return 2.9, 99.0 
	}
}

type MatchedDonor struct {
	User       models.User `json:"user"`
	DistanceKM float64     `json:"distance_km"`
	Score      float64     `json:"score"`
}

// GetSmartMatching evaluates all donors based on blood type, distance, and donation history
func GetSmartMatching(c *gin.Context) {
	lokasiIDStr := c.Query("lokasi_id")
	reqBloodType := c.Query("blood_type")
	reqRhesus := c.Query("rhesus")

	if lokasiIDStr == "" || reqBloodType == "" || reqRhesus == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "lokasi_id, blood_type, dan rhesus wajib diisi"})
		return
	}

	lokasiID, err := strconv.Atoi(lokasiIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "lokasi_id tidak valid"})
		return
	}

	var lokasi models.Lokasi
	if err := database.DB.First(&lokasi, lokasiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lokasi tidak ditemukan"})
		return
	}

	// Fetch all active users (donors) with their donation history
	var users []models.User
	if err := database.DB.Preload("Donations").Where("role = ? AND status = ?", "user", "active").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	var matches []MatchedDonor

	now := time.Now()

	for _, u := range users {
		// 1. Blood Type Filter (Must exactly match)
		if u.GolDarah != reqBloodType || u.Rhesus != reqRhesus {
			continue
		}

		// 2. Donation History Check (Masa tunggu 3 bulan / 90 hari)
		canDonate := true
		for _, donation := range u.Donations {
			// Jika ada donasi sukses dalam 90 hari terakhir
			if donation.Status == "Selesai" {
				daysSince := now.Sub(donation.DonationDate).Hours() / 24
				if daysSince < 90 {
					canDonate = false
					break
				}
			}
		}

		if !canDonate {
			continue
		}

		// 3. Distance Calculation
		userLat, userLng := getCityCoordinates(u.Kota)
		dist := haversine(lokasi.Latitude, lokasi.Longitude, userLat, userLng)

		// 4. Weighted Scoring
		// Base score for matching blood and being eligible is 100
		// Deduct points based on distance (closer = higher score). 
		// Example: max deduction 50 points if distance > 100km.
		score := 100.0
		if dist < 10 {
			score += 50 // Sangat dekat
		} else if dist < 50 {
			score += 30 // Cukup dekat
		} else if dist < 100 {
			score += 10 // Sedang
		}

		// Normalize score to max 100
		finalScore := math.Min(100.0, score)

		matches = append(matches, MatchedDonor{
			User:       u,
			DistanceKM: math.Round(dist*100) / 100, // Round to 2 decimals
			Score:      finalScore,
		})
	}

	// Sort by Score Descending
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].Score > matches[j].Score
	})

	c.JSON(http.StatusOK, gin.H{
		"target_lokasi": gin.H{
			"id":   lokasi.ID,
			"nama": lokasi.NamaLokasi,
		},
		"matches": matches,
	})
}
