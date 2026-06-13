import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  // Ambil string JSON 'user' dulu
  const userString = localStorage.getItem('user');
  let userRole = null;

  // Jika ada data user, kita parse (ubah dari string jadi object)
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userRole = user.role; // Ambil properti 'role' dari dalam object user
    } catch (e) {
      console.error("Gagal parsing data user:", e);
    }
  }
  // Debugging (Opsional, bisa dihapus nanti)
  console.log("Role yang terbaca sistem:", userRole);
  console.log("Role yang diizinkan:", allowedRoles);

  if (!token) {
    return <Navigate to="/pilih-role" replace />;
  }

  // Cek Role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;