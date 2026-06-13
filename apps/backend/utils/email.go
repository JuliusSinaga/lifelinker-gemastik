package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendEmail(to string, subject string, body string) {
	// Ambil config dari .env
	from := os.Getenv("SMTP_EMAIL")
	password := os.Getenv("SMTP_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	// Setup Authentication
	auth := smtp.PlainAuth("", from, password, host)

	// Format Header Email
	// MIME-version dan Content-Type penting agar bisa kirim HTML
	headers := "MIME-version: 1.0;\n" +
		"Content-Type: text/html; charset=\"UTF-8\";\n" +
		fmt.Sprintf("From: LifeLinker Admin <%s>\r\n", from) +
		fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"\r\n"

	// Gabungkan Header dan Body
	msg := []byte(headers + body)

	// Kirim Email (Gunakan address host:port)
	address := host + ":" + port
	
	// Eksekusi pengiriman
	err := smtp.SendMail(address, auth, from, []string{to}, msg)
	if err != nil {
		fmt.Println("❌ Gagal mengirim email:", err)
		return
	}

	fmt.Println("✅ Email berhasil dikirim ke:", to)
}