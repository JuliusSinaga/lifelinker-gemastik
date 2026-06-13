import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Ambil Client ID dari environment variable
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Pengecekan agar tidak error jika env belum di-set
if (!googleClientId) {
  console.warn("⚠️ Google Client ID tidak ditemukan. Pastikan Anda sudah membuat file .env dan mengisi REACT_APP_GOOGLE_CLIENT_ID");
}

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();