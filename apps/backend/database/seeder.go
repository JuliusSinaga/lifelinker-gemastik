package database

import (
	"log"
	"time"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Fungsi utama untuk menjalankan semua seeder
func SeedAll(db *gorm.DB) {
	SeedLokasi(db)
	SeedUsers(db)         // Pastikan User dibuat dulu
	SeedStokDarah(db)     // Butuh Admin
	SeedEvents(db)        // Butuh Lokasi & Admin
	SeedDonations(db)     // Butuh User, Dokter & Lokasi
	SeedConsultations(db) // Butuh User & Dokter
	SeedMessages(db)      // Butuh Konsultasi
}

// --- SEEDER LOKASI ---
func SeedLokasi(db *gorm.DB) {
	var count int64
	db.Model(&models.Lokasi{}).Count(&count)

	if count > 0 {
		return
	}

	lokasiList := []models.Lokasi{
		{
			NamaLokasi:           "RSUP H. Adam Malik",
			AlamatLokasi:         "Jl. Bunga Lau No.17, Medan Tuntungan",
			KontakLokasi:         "(061) 8360051",
			JamOperasionalLokasi: "24 Jam",
			GambarLokasi:         "/images/bg beranda awal.jpg",
			JumlahPendaftar:      15,  // [BARU] Contoh data awal
			BatasKuota:           100, // [BARU] Batas kuota
		},
		{
			NamaLokasi:           "RS HKBP Balige",
			AlamatLokasi:         "Jl. Gereja No.17, Balige",
			KontakLokasi:         "(0632) 21043",
			JamOperasionalLokasi: "08:00 - 16:00",
			GambarLokasi:         "/images/bg beranda awal.jpg",
			JumlahPendaftar:      5,
			BatasKuota:           50,
		},
		{
			NamaLokasi:           "RS Pirngadi",
			AlamatLokasi:         "Jl. Prof. HM. Yamin, Medan",
			KontakLokasi:         "(061) 4158701",
			JamOperasionalLokasi: "24 Jam",
			GambarLokasi:         "/images/bg beranda awal.jpg",
			JumlahPendaftar:      45,
			BatasKuota:           150,
		},
	}

	if err := db.Create(&lokasiList).Error; err != nil {
		log.Printf("Gagal seeding lokasi: %v", err)
	} else {
		log.Println("Seeding Lokasi Berhasil!")
	}
}

// --- SEEDER USER ---
func SeedUsers(db *gorm.DB) {
	var checkUser models.User
	if err := db.Where("email = ?", "admin@lifelinker.com").First(&checkUser).Error; err == nil {
		return
	}

	hash := func(pwd string) string {
		bytes, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
		return string(bytes)
	}

	users := []models.User{
		// 1. ADMIN
		{
			Nama:         "Admin LifeLinker",
			Email:        "admin@lifelinker.com",
			Password:     hash("admin123"),
			Role:         "admin",
			NoHp:         "081111111111",
			Kota:         "Medan",
			TanggalLahir: "1990-01-01",
			Status:       "active",
		},
		// 2. DOKTER 1
		{
			Nama:         "Dr. Anastasya",
			Email:        "dokteranastasya@gmail.com",
			Password:     hash("dokter123"),
			Role:         "dokter",
			NoHp:         "081298765432",
			Kota:         "Medan",
			TanggalLahir: "1985-05-15",
			JenisKelamin: "Perempuan",
			NomorSTR:     "1234567890STR",
			Spesialisasi: "Patologi Klinik",
			Instansi:     "RSUP H. Adam Malik",
			Status:       "active",
		},
		// 3. DOKTER 2
		{
			Nama:         "Dr. Tuti Astuni",
			Email:        "doktertutiastuni@gmail.com",
			Password:     hash("dokter123"),
			Role:         "dokter",
			NoHp:         "081212345678",
			Kota:         "Toba Samosir",
			TanggalLahir: "1988-10-20",
			JenisKelamin: "Perempuan",
			NomorSTR:     "9876543210STR",
			Spesialisasi: "Hematologi",
			Instansi:     "RS HKBP Balige",
			Status:       "active",
		},
		// 4. USER BIASA (PENDONOR) 1
		{
			Nama:         "Budi Setiawan",
			Email:        "budi@gmail.com",
			Password:     hash("user123"),
			Role:         "user",
			NoHp:         "085211112222",
			Kota:         "Medan",
			TanggalLahir: "1995-03-10",
			JenisKelamin: "Laki-laki",
			GolDarah:     "O",
			Rhesus:       "+",
			BeratBadan:   70,
			Status:       "active",
		},
		// 5. USER BIASA (PENDONOR) 2
		{
			Nama:         "Aisha Feransiaka",
			Email:        "aisha@gmail.com",
			Password:     hash("user123"),
			Role:         "user",
			NoHp:         "085233334444",
			Kota:         "Toba Samosir",
			TanggalLahir: "1998-07-25",
			JenisKelamin: "Perempuan",
			GolDarah:     "A",
			Rhesus:       "+",
			BeratBadan:   55,
			Status:       "active",
		},
	}

	for _, user := range users {
		var existing models.User
		if err := db.Where("email = ?", user.Email).First(&existing).Error; err != nil {
			db.Create(&user)
		}
	}
	log.Println("Seeding User Berhasil!")
}

// --- SEEDER STOK DARAH ---
func SeedStokDarah(db *gorm.DB) {
	var count int64
	db.Model(&models.StokDarah{}).Count(&count)

	if count > 0 {
		return
	}

	var admin models.User
	if err := db.Where("role = ?", "admin").First(&admin).Error; err != nil {
		log.Println("Skip Stok Darah: Admin tidak ditemukan.")
		return
	}

	stokList := []models.StokDarah{
		{GolDarah: "A", Rhesus: "+", Ketersediaan: "Aman", JumlahKantong: 50, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "A", Rhesus: "-", Ketersediaan: "Kurang", JumlahKantong: 10, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "B", Rhesus: "+", Ketersediaan: "Aman", JumlahKantong: 45, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "B", Rhesus: "-", Ketersediaan: "Kritis", JumlahKantong: 3, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "AB", Rhesus: "+", Ketersediaan: "Kurang", JumlahKantong: 15, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "AB", Rhesus: "-", Ketersediaan: "Kritis", JumlahKantong: 2, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "O", Rhesus: "+", Ketersediaan: "Aman", JumlahKantong: 80, WaktuPembaruan: time.Now(), AdminID: admin.ID},
		{GolDarah: "O", Rhesus: "-", Ketersediaan: "Aman", JumlahKantong: 25, WaktuPembaruan: time.Now(), AdminID: admin.ID},
	}

	if err := db.Create(&stokList).Error; err != nil {
		log.Printf("Gagal seeding stok darah: %v", err)
	} else {
		log.Println("Seeding Stok Darah Berhasil!")
	}
}

// --- SEEDER EVENT ---
func SeedEvents(db *gorm.DB) {
	var count int64
	db.Model(&models.Event{}).Count(&count)
	if count > 0 {
		return
	}

	var admin models.User
	var lokasi models.Lokasi

	if err := db.Where("role = ?", "admin").First(&admin).Error; err != nil {
		log.Println("Skip Events: Admin tidak ditemukan.")
		return
	}

	if err := db.First(&lokasi).Error; err != nil {
		log.Println("Skip Events: Lokasi tidak ditemukan.")
		return
	}

	events := []models.Event{
		{
			NamaEvent:      "Donor Darah Serentak Medan",
			TanggalEvent:   time.Now().AddDate(0, 0, 7),
			DeskripsiEvent: "Ayo ikut serta dalam aksi kemanusiaan donor darah masal di pusat kota Medan.",
			GambarEvent:    "/images/bg beranda awal.jpg",
			LokasiID:       lokasi.ID,
			OrganizerID:    admin.ID,
			Status:         "approved",
		},
		{
			NamaEvent:      "Kampanye Sehat Bersama LifeLinker",
			TanggalEvent:   time.Now().AddDate(0, 1, 0),
			DeskripsiEvent: "Kegiatan rutin donor darah untuk menjaga ketersediaan stok darah nasional.",
			GambarEvent:    "/images/bg beranda awal.jpg",
			LokasiID:       lokasi.ID,
			OrganizerID:    admin.ID,
			Status:         "pending",
		},
	}

	if err := db.Create(&events).Error; err != nil {
		log.Printf("Gagal seeding event: %v", err)
	} else {
		log.Println("Seeding Event Berhasil!")
	}
}

// --- SEEDER DONASI (UPDATED) ---
func SeedDonations(db *gorm.DB) {
	var count int64
	db.Model(&models.DonationHistory{}).Count(&count)
	if count > 0 {
		return
	}

	var user, dokter models.User
	var lokasi models.Lokasi // [BARU] Wajib ambil lokasi

	if err := db.Where("email = ?", "budi@gmail.com").First(&user).Error; err != nil {
		log.Println("Skip SeedDonations: User tidak ditemukan.")
		return
	}
	if err := db.Where("email = ?", "dokteranastasya@gmail.com").First(&dokter).Error; err != nil {
		log.Println("Skip SeedDonations: Dokter tidak ditemukan.")
		return
	}
	// Ambil lokasi pertama untuk dummy
	if err := db.First(&lokasi).Error; err != nil {
		log.Println("Skip SeedDonations: Lokasi tidak ditemukan.")
		return
	}

	// Variabel bantu untuk pointer
	qty350 := 350

	donations := []models.DonationHistory{
		// 1. Contoh Donasi Selesai (Ada Dokter & Quantity)
		{
			UserID:          user.ID,
			DoctorID:        &dokter.ID, // [UPDATED] Pointer
			LokasiID:        lokasi.ID,  // [UPDATED] Wajib
			DonationDate:    time.Now().AddDate(0, -3, 0),
			BloodType:       user.GolDarah,
			QuantityDonated: &qty350, // [UPDATED] Pointer
			Status:          "Approved",
			Notes:           "Donor berhasil tanpa kendala.",
		},
		// 2. Contoh Pendaftaran Online (Pending, Dokter Kosong)
		{
			UserID:          user.ID,
			DoctorID:        nil,       // [UPDATED] Belum ada dokter
			LokasiID:        lokasi.ID, // [UPDATED] Wajib
			DonationDate:    time.Now().AddDate(0, 0, 1),
			BloodType:       user.GolDarah,
			QuantityDonated: nil, // [UPDATED] Belum donor
			Status:          "Pending",
			Notes:           "Pendaftaran mandiri via aplikasi.",
		},
	}

	if err := db.Create(&donations).Error; err != nil {
		log.Printf("Gagal seeding donasi: %v", err)
	} else {
		log.Println("Seeding Riwayat Donasi Berhasil!")
	}
}

// --- SEEDER KONSULTASI ---
func SeedConsultations(db *gorm.DB) {
	var count int64
	db.Model(&models.Consultation{}).Count(&count)
	if count > 0 {
		return
	}

	var user, dokter models.User

	if err := db.Where("email = ?", "budi@gmail.com").First(&user).Error; err != nil {
		return
	}
	if err := db.Where("email = ?", "dokteranastasya@gmail.com").First(&dokter).Error; err != nil {
		return
	}

	consultations := []models.Consultation{
		{
			UserID:           user.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().AddDate(0, 0, -2).Format("2006-01-02"),
			ConsultationTime: "10:00",
			Topic:            "Efek Samping Donor",
			Status:           "Completed",
			ZoomLink:         "", // Kosongkan jika completed
		},
		{
			UserID:           user.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().Format("2006-01-02"),
			ConsultationTime: "14:00",
			Topic:            "Syarat Donor Flu Ringan",
			Status:           "Scheduled",
			ZoomLink:         "https://zoom.us/j/dummy-link", // Contoh link
		},
	}

	if err := db.Create(&consultations).Error; err != nil {
		log.Printf("Gagal seeding konsultasi: %v", err)
	} else {
		log.Println("Seeding Konsultasi Berhasil!")
	}
}

// --- SEEDER PESAN CHAT ---
func SeedMessages(db *gorm.DB) {
	var count int64
	db.Model(&models.Message{}).Count(&count)
	if count > 0 {
		return
	}

	// Ambil Konsultasi Pertama
	var consult models.Consultation
	if err := db.First(&consult).Error; err != nil {
		log.Println("Skip SeedMessages: Konsultasi tidak ditemukan.")
		return
	}

	messages := []models.Message{
		{
			ConsultationID: consult.ID,
			SenderRole:     "patient",
			Text:           "Halo Dok, saya sering merasa pusing setelah donor darah. Apakah itu normal?",
		},
		{
			ConsultationID: consult.ID,
			SenderRole:     "doctor",
			Text:           "Halo Pak Budi. Itu hal yang wajar jika tubuh belum terbiasa atau kurang istirahat.",
		},
		{
			ConsultationID: consult.ID,
			SenderRole:     "doctor",
			Text:           "Pastikan Anda minum banyak air putih sebelum dan sesudah donor, serta hindari aktivitas berat selama 24 jam.",
		},
		{
			ConsultationID: consult.ID,
			SenderRole:     "patient",
			Text:           "Baik Dok, terima kasih sarannya.",
		},
	}

	if err := db.Create(&messages).Error; err != nil {
		log.Printf("Gagal seeding pesan: %v", err)
	} else {
		log.Println("Seeding Pesan Chat Berhasil!")
	}
}