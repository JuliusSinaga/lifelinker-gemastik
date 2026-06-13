package utils

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time" // Aktifkan package time
)

// Struct untuk Response Token OAuth
type ZoomTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
}

// Struct untuk Request Create Meeting
type CreateMeetingRequest struct {
	Topic     string `json:"topic"`
	Type      int    `json:"type"` // 2 = Scheduled Meeting
	StartTime string `json:"start_time"`
	Duration  int    `json:"duration"` // Menit
	Timezone  string `json:"timezone"`
}

// Struct Response dari Create Meeting
type ZoomMeetingResponse struct {
	ID      int64  `json:"id"`
	JoinURL string `json:"join_url"`
}

// 1. Fungsi Mendapatkan Access Token (Server-to-Server)
func GetZoomAccessToken() (string, error) {
	accountID := os.Getenv("ZOOM_ACCOUNT_ID")
	clientID := os.Getenv("ZOOM_CLIENT_ID")
	clientSecret := os.Getenv("ZOOM_CLIENT_SECRET")

	url := fmt.Sprintf("https://zoom.us/oauth/token?grant_type=account_credentials&account_id=%s", accountID)
	req, _ := http.NewRequest("POST", url, nil)

	// Basic Auth (ClientID:ClientSecret di-encode base64)
	auth := base64.StdEncoding.EncodeToString([]byte(clientID + ":" + clientSecret))
	req.Header.Add("Authorization", "Basic "+auth)

	// Gunakan Timeout 10 detik agar tidak hanging
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("gagal auth zoom: status %d", resp.StatusCode)
	}

	var tokenResp ZoomTokenResponse
	json.NewDecoder(resp.Body).Decode(&tokenResp)
	return tokenResp.AccessToken, nil
}

// 2. Fungsi Membuat Meeting
func CreateZoomMeeting(topic string, startTime string) (string, string, error) {
	token, err := GetZoomAccessToken()
	if err != nil {
		return "", "", err
	}

	// Format Tanggal: "2024-12-25T10:00:00"
	reqBody := CreateMeetingRequest{
		Topic:     topic,
		Type:      2,  // Scheduled
		StartTime: startTime, // Format ISO8601 (YYYY-MM-DDTHH:MM:SS)
		Duration:  60, // Default 60 menit
		Timezone:  "Asia/Jakarta",
	}

	jsonData, _ := json.Marshal(reqBody)
	
	// API Endpoint: Create meeting for 'me' (user pemilik akun API)
	url := "https://api.zoom.us/v2/users/me/meetings"
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Add("Authorization", "Bearer "+token)
	req.Header.Add("Content-Type", "application/json")

	// Gunakan Timeout 10 detik
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		body, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("gagal buat meeting: %s", string(body))
	}

	var meetingResp ZoomMeetingResponse
	json.NewDecoder(resp.Body).Decode(&meetingResp)

	return meetingResp.JoinURL, fmt.Sprintf("%d", meetingResp.ID), nil
}