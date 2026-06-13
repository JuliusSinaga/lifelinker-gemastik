package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"path/filepath"
    "os"

	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/database"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/models"
	"github.com/JuliusSinaga/LifeLinker-PPW11/backend/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Struct Input
type GoogleLoginRequest struct {
	IDToken string `json:"id_token"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// ----------------------------------------------------
// FITUR 1: LOGIN DENGAN GOOGLE
// ----------------------------------------------------
func GoogleLogin(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request salah"})
		return
	}

	// 1. Verifikasi Access Token ke Google
	resp, err := http.Get("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + req.IDToken)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token Google tidak valid"})
		return
	}
	defer resp.Body.Close()

	// 2. Decode Response
	var googleData struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data Google"})
		return
	}

	// 3. Cek Database / Auto-Register
	var user models.User
	result := database.DB.Where("email = ?", googleData.Email).First(&user)

	if result.Error != nil {
		// User belum ada -> Buat Baru (Default Role: User)
		user = models.User{
			Nama:     googleData.Name,
			Email:    googleData.Email,
			Password: "",
			Role:     "user",
			Status:   "active", // User biasa via Google langsung aktif
		}
		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal registrasi user baru"})
			return
		}
	}

	// 4. Response Sukses
	c.JSON(http.StatusOK, gin.H{
		"message": "Login Google berhasil",
		"token":   "DUMMY_JWT_TOKEN_12345", // Ganti dengan JWT asli nanti
		"user":    formatUserResponse(user),
	})
}

// ----------------------------------------------------
// FITUR 2: LOGIN MANUAL
// ----------------------------------------------------
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan Password wajib diisi"})
		return
	}

	var user models.User
	// Cek Email
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Cek Password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah"})
		return
	}

	// Cek Status Akun (Penting untuk Dokter)
	if user.Role == "dokter" && user.Status == "pending" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Akun Anda masih dalam proses verifikasi Admin. Mohon cek email Anda.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   "DUMMY_JWT_TOKEN_MANUAL_54321",
		"user":    formatUserResponse(user),
	})
}

// ----------------------------------------------------
// FITUR 3: REGISTER MANUAL (POST /users)
// ----------------------------------------------------
func CreateUser(c *gin.Context) {
	var user models.User

	// Pastikan Frontend mengirim tipe data yang benar (int untuk berat badan/umur, dll)
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default Role
	if user.Role == "" {
		user.Role = "user"
	}

	// Logic Status Akun
	if user.Role == "dokter" {
		user.Status = "pending" // Dokter harus diverifikasi
	} else {
		user.Status = "active" // User biasa langsung aktif
	}

	// Hash Password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)

	// Simpan Database
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Email mungkin sudah terdaftar"})
		return
	}

	// Kirim Email Notifikasi (Background Process)
	go func() {
		subject := "Selamat Datang di LifeLinker!"
		var body string

		if user.Role == "dokter" {
			subject = "Pendaftaran Diterima - Menunggu Verifikasi Admin"
			body = fmt.Sprintf(`
				<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
					<h2 style="color: #0284c7;">Halo Dr. %s,</h2>
					<p>Terima kasih telah mendaftar di <b>LifeLinker</b>.</p>
					<div style="background-color: #fef3c7; padding: 15px; border-left: 5px solid #d97706; margin: 20px 0;">
						<p style="margin: 0; font-weight: bold;">Status Akun: MENUNGGU VERIFIKASI (PENDING)</p>
					</div>
					<p>Tim Admin kami sedang memverifikasi Nomor STR: <b>%s</b>.</p>
					<p>Mohon menunggu 1x24 jam. Anda akan menerima email notifikasi saat akun Anda diaktifkan.</p>
				</div>
			`, user.Nama, user.NomorSTR)
		} else {
			subject = "Selamat Datang di LifeLinker"
			body = fmt.Sprintf(`
				<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
					<h2 style="color: #dc2626;">Halo %s,</h2>
					<p>Selamat bergabung menjadi pahlawan kemanusiaan di <b>LifeLinker</b>!</p>
					<p>Akun Anda telah aktif. Silakan login untuk mencari lokasi donor darah terdekat.</p>
				</div>
			`, user.Nama)
		}

		utils.SendEmail(user.Email, subject, body)
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran berhasil",
		"user":    formatUserResponse(user),
	})
}

// ----------------------------------------------------
// FITUR 4: VERIFIKASI DOKTER (ADMIN ONLY)
// ----------------------------------------------------
func VerifyDoctor(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	if user.Role != "dokter" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User bukan dokter"})
		return
	}

	// Update Status jadi Active
	user.Status = "active"
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memverifikasi dokter"})
		return
	}

	// Kirim Email Sukses
	go func() {
		subject := "SELAMAT! Akun Dokter LifeLinker Anda Telah Aktif"
		body := fmt.Sprintf(`
			<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
				<h2 style="color: #16a34a;">Verifikasi Berhasil</h2>
				<p>Halo <b>Dr. %s</b>,</p>
				<p>Selamat! Data profesional dan Nomor STR Anda telah berhasil diverifikasi oleh Admin.</p>
				<p>Status akun Anda sekarang: <b style="color: green;">AKTIF</b>.</p>
				<p>Silakan login untuk mulai mengelola stok darah dan event.</p>
			</div>
		`, user.Nama)

		utils.SendEmail(user.Email, subject, body)
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "Dokter berhasil diverifikasi",
		"data":    formatUserResponse(user),
	})
}

// ----------------------------------------------------
// FITUR 5: GET ALL USERS
// ----------------------------------------------------
func GetUsers(c *gin.Context) {
	var users []models.User

	// Ambil semua data user
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data user"})
		return
	}

	// Format data agar JSON key-nya konsisten (id, name, email, dll)
	var formattedUsers []map[string]interface{}
	for _, user := range users {
		formattedUsers = append(formattedUsers, formatUserResponse(user))
	}

	c.JSON(http.StatusOK, gin.H{"data": formattedUsers})
}

// ----------------------------------------------------
// FITUR 6: UPDATE PROFIL USER (PUT /users/:id)
// ----------------------------------------------------
func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Bind input ke struct User
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Password = ""
	input.Role = ""
	input.Email = ""
	input.Status = ""

	// Lakukan update (GORM Updates hanya mengupdate field yang tidak kosong/zero value)
	if err := database.DB.Model(&user).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui profil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"data":    formatUserResponse(user),
	})
}

// --- FITUR: LUPA PASSWORD (Minta Link) ---
func ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email wajib diisi"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email tidak ditemukan"})
		return
	}

	// 1. Generate Token Random
	bytes := make([]byte, 16)
	rand.Read(bytes)
	token := hex.EncodeToString(bytes)

	// 2. Simpan Token & Expiry (misal 15 menit) ke DB
	user.ResetToken = token
	user.ResetTokenExpiry = time.Now().Add(15 * time.Minute)
	database.DB.Save(&user)

	// 3. Kirim Email
	resetLink := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", token)

	subject := "Reset Password - LifeLinker"
	body := fmt.Sprintf(`
        <h3>Halo %s,</h3>
        <p>Anda meminta untuk mereset password akun LifeLinker Anda.</p>
        <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
        <a href="%s" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Link ini hanya berlaku selama 15 menit.</p>
    `, user.Nama, resetLink)

	go utils.SendEmail(user.Email, subject, body)

	c.JSON(http.StatusOK, gin.H{"message": "Link reset password telah dikirim ke email Anda"})
}

// --- FITUR: RESET PASSWORD (Eksekusi Ganti Password) ---
func ResetPassword(c *gin.Context) {
	var input struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak lengkap"})
		return
	}

	var user models.User
	// Cari user berdasarkan Token DAN pastikan Token belum kadaluarsa
	if err := database.DB.Where("reset_token = ? AND reset_token_expiry > ?", input.Token, time.Now()).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak valid atau sudah kadaluwarsa"})
		return
	}

	// Hash Password Baru
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)

	// Update Data User
	user.Password = string(hashedPassword)
	user.ResetToken = "" // Hapus token

	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diubah. Silakan login kembali."})
}

// Endpoint: DELETE /users/:id
func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dihapus"})
}

// PUT /users/:id/password (Ganti Password Logged In)
func UpdatePassword(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak lengkap"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Verifikasi Password Lama
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password lama salah!"})
		return
	}

	// Hash Password Baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	if err := database.DB.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan password baru"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diperbarui"})
}

// Helper: Format JSON Response
func formatUserResponse(u models.User) map[string]interface{} {
	return map[string]interface{}{
		"id":             u.ID,
		"name":           u.Nama,
		"email":          u.Email,
		"role":           u.Role,
		"status":         u.Status,
		"phone":          u.NoHp,
		"city":           u.Kota,
		"blood_type":     u.GolDarah,
		"rhesus":         u.Rhesus,
		"weight":         u.BeratBadan,
		"birth_date":     u.TanggalLahir,
		"gender":         u.JenisKelamin,
		"str_number":     u.NomorSTR,
		"specialization": u.Spesialisasi,
		"hospital":       u.Instansi,
		"photo_url":      u.PhotoURL, // <--- TAMBAHKAN INI
	}
}

// POST /users/:id/avatar
func UploadUserAvatar(c *gin.Context) {
    id := c.Param("id")

    // Ambil file
    file, err := c.FormFile("avatar")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File gambar wajib diunggah"})
        return
    }

    // Simpan file
    uploadDir := "./public/uploads"
    if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
        os.MkdirAll(uploadDir, os.ModePerm)
    }

    filename := fmt.Sprintf("user_%s_avatar%s", id, filepath.Ext(file.Filename))
    savePath := fmt.Sprintf("%s/%s", uploadDir, filename)

    if err := c.SaveUploadedFile(file, savePath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
        return
    }

    baseURL := os.Getenv("BASE_URL")
    photoURL := fmt.Sprintf("%s/uploads/%s", baseURL, filename)

    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
        return
    }

    user.PhotoURL = photoURL
    database.DB.Save(&user)

    c.JSON(http.StatusOK, gin.H{
        "message":   "Foto profil berhasil diperbarui",
        "photo_url": photoURL,
    })
}