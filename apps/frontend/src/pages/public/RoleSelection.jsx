import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RoleSelection.css";
import Button from "../../components/core/Button";
import Card from "../../components/core/Card";
import Icon from "../../components/core/Icon";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-root" style={{ background: 'var(--color-bg-auth)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main className="role-main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="role-container" style={{ maxWidth: '900px', width: '100%' }}>
          {/* Header */}
          <header className="role-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="role-logo-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <img
                src={process.env.PUBLIC_URL + "/images/lifelinker-logo.png"}
                alt="LifeLinker Logo"
                className="role-logo-image"
                style={{ height: '40px' }}
              />
              <h1 className="lifelinker-logo" style={{ fontFamily: 'var(--font-family-brand)', fontSize: '32px', margin: 0 }}>
                <span style={{ color: 'var(--color-brand-primary)' }}>Life</span><span style={{ color: 'var(--color-text-primary)' }}>Linker</span>
              </h1>
            </div>
            <h2 className="welcome-title" style={{ fontFamily: 'var(--font-family-primary)', fontSize: '24px', fontWeight: 'var(--font-weight-bold)', marginBottom: '8px' }}>Selamat Datang</h2>
            <p className="subtitle" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-primary)' }}>Silakan pilih peran untuk melanjutkan</p>
          </header>

          {/* Role Cards */}
          <div className="role-card-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

            {/* === Pengguna === */}
            <Card variant="role" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Icon icon="mdi:account" width="96" style={{ color: 'var(--color-brand-primary)', marginBottom: '16px' }} />
              <h3 style={{ fontFamily: 'var(--font-family-primary)', fontSize: '20px', marginBottom: '16px' }}>Pengguna</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', flex: 1 }}>
                Login sebagai pengguna untuk donor darah atau mencari donor.
              </p>
              <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/login-pengguna")}
                >
                  Masuk sebagai Pengguna
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate("/daftar-pengguna")}
                >
                  Daftar Akun
                </Button>
              </div>
            </Card>

            {/* === Dokter === */}
            <Card variant="role" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Icon icon="fontisto:doctor" width="96" style={{ color: 'var(--color-brand-primary)', marginBottom: '16px' }} />
              <h3 style={{ fontFamily: 'var(--font-family-primary)', fontSize: '20px', marginBottom: '16px' }}>Dokter</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', flex: 1 }}>
                Login sebagai dokter untuk mengelola sistem donor darah (perlu
                verifikasi STR).
              </p>
              <div className="btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/login-dokter")}
                >
                  Masuk sebagai Dokter
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate("/daftar-dokter")}
                >
                  Daftar Akun
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
