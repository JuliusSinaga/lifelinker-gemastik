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
	SeedEducation(db)     // Edukasi & FAQ
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
			Latitude:             3.5186,
			Longitude:            98.6025,
		},
		{
			NamaLokasi:           "RS HKBP Balige",
			AlamatLokasi:         "Jl. Gereja No.17, Balige",
			KontakLokasi:         "(0632) 21043",
			JamOperasionalLokasi: "08:00 - 16:00",
			GambarLokasi:         "/images/bg beranda awal.jpg",
			JumlahPendaftar:      5,
			BatasKuota:           50,
			Latitude:             2.3333,
			Longitude:            99.0667,
		},
		{
			NamaLokasi:           "RS Pirngadi",
			AlamatLokasi:         "Jl. Prof. HM. Yamin, Medan",
			KontakLokasi:         "(061) 4158701",
			JamOperasionalLokasi: "24 Jam",
			GambarLokasi:         "/images/bg beranda awal.jpg",
			JumlahPendaftar:      45,
			BatasKuota:           150,
			Latitude:             3.5950,
			Longitude:            98.6850,
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
	// Hapus semua riwayat donasi lama agar sinkron dengan data mockup baru
	db.Unscoped().Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.DonationHistory{})

	var user models.User
	var dokter models.User
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

	// Hapus dummy users sebelumnya jika ada (gunakan Unscoped agar terhapus permanen dan tidak bentrok UNIQUE constraint)
	db.Unscoped().Where("email IN ?", []string{
		"juniah@example.com", "kaojey@example.com", "damia@example.com", 
		"lisbue@example.com", "andika@example.com", "kael@example.com",
	}).Delete(&models.User{})

	// Buat Dummy Users untuk Pendonor Khusus
	mockupUsers := []models.User{
		{Nama: "Juniah Jaos", Email: "juniah@example.com", Password: "password123", Role: "user", GolDarah: "A", Rhesus: "+", NoHp: "081234567890", Kota: "Medan", TanggalLahir: "1995-02-10", JenisKelamin: "Perempuan"},
		{Nama: "Kaojey Sloha", Email: "kaojey@example.com", Password: "password123", Role: "user", GolDarah: "A", Rhesus: "+", NoHp: "081298765432", Kota: "Medan", TanggalLahir: "1992-07-22", JenisKelamin: "Laki-laki"},
		{Nama: "Damia Loe", Email: "damia@example.com", Password: "password123", Role: "user", GolDarah: "B", Rhesus: "-", NoHp: "082155556666", Kota: "Binjai", TanggalLahir: "1998-11-05", JenisKelamin: "Perempuan"},
		{Nama: "Lisbue Reas", Email: "lisbue@example.com", Password: "password123", Role: "user", GolDarah: "B", Rhesus: "+", NoHp: "085233334444", Kota: "Medan", TanggalLahir: "1990-03-18", JenisKelamin: "Laki-laki"},
		{Nama: "Andika Olo", Email: "andika@example.com", Password: "password123", Role: "user", GolDarah: "O", Rhesus: "+", NoHp: "081377778888", Kota: "Deli Serdang", TanggalLahir: "1996-09-30", JenisKelamin: "Laki-laki"},
		{Nama: "Kael Simatu", Email: "kael@example.com", Password: "password123", Role: "user", GolDarah: "O", Rhesus: "-", NoHp: "081199990000", Kota: "Medan", TanggalLahir: "2000-01-25", JenisKelamin: "Laki-laki"},
	}
	db.Create(&mockupUsers)

	qty1 := 1
	qty2 := 2

	// Format tanggal: Tahun 2025
	t1, _ := time.Parse("2006-01-02", "2025-01-02")
	t2, _ := time.Parse("2006-01-02", "2025-01-03")
	t3, _ := time.Parse("2006-01-02", "2025-01-04")
	t4, _ := time.Parse("2006-01-02", "2025-01-05")
	t5, _ := time.Parse("2006-01-02", "2025-01-05")
	t6, _ := time.Parse("2006-01-02", "2025-01-06")

	donations := []models.DonationHistory{
		{UserID: mockupUsers[0].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t1, BloodType: "A", QuantityDonated: &qty1, Status: "Tersedia"},
		{UserID: mockupUsers[1].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t2, BloodType: "A", QuantityDonated: &qty2, Status: "Tersedia"},
		{UserID: mockupUsers[2].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t3, BloodType: "B", QuantityDonated: &qty2, Status: "Tersedia"},
		{UserID: mockupUsers[3].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t4, BloodType: "B", QuantityDonated: &qty2, Status: "Tersedia"},
		{UserID: mockupUsers[4].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t5, BloodType: "O", QuantityDonated: &qty1, Status: "Digunakan"},
		{UserID: mockupUsers[5].ID, DoctorID: &dokter.ID, LokasiID: lokasi.ID, DonationDate: t6, BloodType: "O", QuantityDonated: &qty1, Status: "Digunakan"},
	}

	if err := db.Create(&donations).Error; err != nil {
		log.Printf("Gagal seeding donasi: %v", err)
	} else {
		log.Println("Seeding Riwayat Donasi Berhasil!")
	}
}

// --- SEEDER KONSULTASI ---
func SeedConsultations(db *gorm.DB) {
	// Hapus semua pesan terlebih dahulu untuk menghindari error Foreign Key
	db.Unscoped().Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Message{})

	// Baru hapus semua konsultasi lama
	db.Unscoped().Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Consultation{})

	var user models.User
	var dokter models.User
	var aisha models.User
	db.Where("email = ?", "budi@gmail.com").First(&user)
	db.Where("email = ?", "dokteranastasya@gmail.com").First(&dokter)
	db.Where("email = ?", "aisha@gmail.com").First(&aisha)

	consultations := []models.Consultation{
		{
			UserID:           user.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().AddDate(0, 0, -2).Format("2006-01-02"),
			ConsultationTime: "10:00",
			Topic:            "Efek Samping Donor",
			Method:           "chat",
			Status:           "active",
			ZoomLink:         "",
		},
		{
			UserID:           user.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().Format("2006-01-02"),
			ConsultationTime: "14:00",
			Topic:            "Syarat Donor Flu Ringan",
			Method:           "chat",
			Status:           "active",
			ZoomLink:         "",
		},
		{
			UserID:           aisha.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().Format("2006-01-02"),
			ConsultationTime: "08:30",
			Topic:            "Pantangan Sebelum Donor Darah Pertama",
			Method:           "chat",
			Status:           "active",
			ZoomLink:         "",
		},
		{
			UserID:           user.ID,
			DoctorID:         dokter.ID,
			ConsultationDate: time.Now().Format("2006-01-02"),
			ConsultationTime: "16:00",
			Topic:            "Konsultasi Pra-Donor via Video",
			Method:           "video",
			Status:           "Scheduled",
			ZoomLink:         "https://zoom.us/j/1234567890",
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
	// (Pesan lama sudah dihapus di dalam SeedConsultations)

	// Ambil semua Konsultasi
	var consults []models.Consultation
	if err := db.Find(&consults).Error; err != nil || len(consults) == 0 {
		log.Println("Skip SeedMessages: Konsultasi tidak ditemukan.")
		return
	}

	messages := []models.Message{}

	// Pesan untuk Konsultasi 1 (Efek Samping Donor)
	if len(consults) > 0 {
		messages = append(messages, 
			models.Message{ConsultationID: consults[0].ID, SenderRole: "patient", Text: "Halo Dok, saya sering merasa pusing setelah donor darah. Apakah itu normal?"},
			models.Message{ConsultationID: consults[0].ID, SenderRole: "doctor", Text: "Halo Pak Budi. Itu hal yang wajar jika tubuh belum terbiasa atau kurang istirahat."},
			models.Message{ConsultationID: consults[0].ID, SenderRole: "doctor", Text: "Pastikan Anda minum banyak air putih sebelum dan sesudah donor, serta hindari aktivitas berat selama 24 jam."},
			models.Message{ConsultationID: consults[0].ID, SenderRole: "patient", Text: "Baik Dok, terima kasih sarannya."},
		)
	}

	// Pesan untuk Konsultasi 2 (Syarat Donor Flu Ringan)
	if len(consults) > 1 {
		messages = append(messages, 
			models.Message{ConsultationID: consults[1].ID, SenderRole: "patient", Text: "Selamat siang Dokter, saat ini saya sedang flu ringan (hanya bersin). Apakah saya boleh mendonorkan darah besok?"},
			models.Message{ConsultationID: consults[1].ID, SenderRole: "doctor", Text: "Siang Pak Budi. Sebaiknya ditunda dulu ya. Pendonor harus dalam keadaan 100% fit dan tidak sedang mengonsumsi obat-obatan."},
		)
	}

	// Pesan untuk Konsultasi 3 (Pantangan Aisha)
	if len(consults) > 2 {
		messages = append(messages, 
			models.Message{ConsultationID: consults[2].ID, SenderRole: "patient", Text: "Permisi Dok, ini kali pertama saya mau donor. Apakah ada pantangan makanan sebelumnya?"},
			models.Message{ConsultationID: consults[2].ID, SenderRole: "doctor", Text: "Halo Aisha! Selamat ya untuk keberaniannya. Hindari makanan berlemak tinggi (seperti gorengan atau fast food) minimal 4 jam sebelum donor karena dapat memengaruhi kualitas plasma darah."},
			models.Message{ConsultationID: consults[2].ID, SenderRole: "doctor", Text: "Perbanyak makan sayur bayam atau daging merah agar zat besi Anda cukup."},
			models.Message{ConsultationID: consults[2].ID, SenderRole: "patient", Text: "Wah, noted Dok! Terima kasih banyak infonya."},
		)
	}

	if err := db.Create(&messages).Error; err != nil {
		log.Printf("Gagal seeding pesan: %v", err)
	} else {
		log.Println("Seeding Pesan Chat Berhasil!")
	}
}

// --- SEEDER EDUCATION & FAQ ---
func SeedEducation(db *gorm.DB) {
	var count int64
	db.Model(&models.Education{}).Count(&count)

	if count > 0 {
		log.Println("Data Education sudah ada, lewati seeding.")
		return
	}

	educationData := []models.Education{
		{
			Judul:    "Syarat Utama Menjadi Pendonor Darah",
			Konten:   "Untuk menjadi pendonor darah, Anda harus memenuhi syarat berikut: \n1. Berusia 17-60 tahun.\n2. Berat badan minimal 45 kg.\n3. Sehat jasmani dan rohani.\n4. Tidak memiliki riwayat penyakit menular seperti HIV/AIDS, Hepatitis B/C, atau Sifilis.\n5. Tidak sedang mengonsumsi obat tertentu.",
			Kategori: "Syarat & Ketentuan",
		},
		{
			Judul:    "Persiapan Sebelum Donor Darah",
			Konten:   "1. Tidur yang cukup minimal 5 jam sebelum donor.\n2. Makan makanan bergizi 3-4 jam sebelum donor.\n3. Minum lebih banyak air putih.\n4. Hindari aktivitas fisik berat sehari sebelum donor.",
			Kategori: "Persiapan",
		},
		{
			Judul:    "Mitos dan Fakta seputar Donor Darah",
			Konten:   "Mitos: Donor darah membuat gemuk.\nFakta: Donor darah membakar sekitar 650 kalori per pint (sekitar 450 ml), namun tidak secara langsung menyebabkan penurunan berat badan jangka panjang. Tidak ada kaitan dengan obesitas.",
			Kategori: "FAQ",
		},
		{
			Judul:    "Apa yang Terjadi Setelah Donor Darah?",
			Konten:   "Setelah donor, darah Anda akan dikirim ke laboratorium untuk diuji penyakit infeksi menular. Jika aman, darah akan dipisah menjadi komponen (sel darah merah, trombosit, plasma) untuk diberikan kepada pasien yang membutuhkan. Tubuh Anda akan meregenerasi volume cairan dalam 24 jam dan sel darah merah dalam 4-6 minggu.",
			Kategori: "Informasi",
		},
	}

	for _, edu := range educationData {
		db.Create(&edu)
	}
	log.Println("Seeding Education Berhasil!")
}