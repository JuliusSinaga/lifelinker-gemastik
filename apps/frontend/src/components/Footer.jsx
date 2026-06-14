import React from "react";
import "../styles/Footer.css";
import Icon from "./core/Icon";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        {/* Company Info */}
        <div className="app-footer-section">
          <div className="app-footer-logo">
            <img
              src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
              alt="LifeLinker Logo"
              className="app-footer-logo-image"
            />
            <h3>LifeLinker</h3>
          </div>
          <p>
            Platform donor darah terpercaya yang menghubungkan pendonor dengan
            yang membutuhkan. Mari bersama-sama menyelamatkan nyawa melalui
            donasi darah.
          </p>
          <div className="app-footer-social">
            <a href="#!" aria-label="Facebook">
              <Icon icon="ic:baseline-facebook" width="24" />
            </a>
            <a href="#!" aria-label="Twitter">
              <Icon icon="formkit:twitter" width="24" />
            </a>
            <a href="#!" aria-label="Instagram">
              <Icon icon="ri:instagram-fill" width="24" />
            </a>
            <a href="#!" aria-label="LinkedIn">
              <Icon icon="mdi:linkedin" width="24" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="app-footer-section">
          <h4>Menu Utama</h4>
          <ul>
            <li>
              <a href="/">Beranda</a>
            </li>
            <li>
              <a href="/lokasi-donor">Lokasi Donor</a>
            </li>
            <li>
              <a href="/stok-darah">Stok Darah</a>
            </li>
            <li>
              <a href="/event">Event</a>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className="app-footer-section">
          <h4>Layanan</h4>
          <ul>
            <li>
              <a href="/riwayat">Riwayat Donor</a>
            </li>
            <li>
              <a href="/konsultasi">Konsultasi</a>
            </li>
            <li>
              <a href="/profile">Profil Saya</a>
            </li>
            <li>
              <a href="/role-selection">Daftar Donor</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="app-footer-section">
          <h4>Hubungi Kami</h4>
          <div className="app-footer-contact">
            <div className="app-contact-item">
              <Icon icon="mdi:phone" width="20" />
              <span>+62 21 1234 5678</span>
            </div>
            <div className="app-contact-item">
              <Icon icon="mdi:email" width="20" />
              <span>info@lifelinker.id</span>
            </div>
            <div className="app-contact-item">
              <Icon icon="mdi:map-marker" width="20" />
              <span>Sitoluama, Sumatera Utara</span>
            </div>
          </div>
        </div>
      </div>

      <div className="app-footer-bottom">
        <div className="app-footer-bottom-content">
          <p>&copy; 2024 LifeLinker. All rights reserved.</p>
          <div className="app-footer-bottom-links">
            <a href="/privacy">Kebijakan Privasi</a>
            <a href="/terms">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
