import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menangani request: Menyisipkan token JWT otomatis
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani response: Tangani 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token kadaluarsa atau tidak valid, auto logout
      console.warn("Unauthorized! Clearing token and redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      
      // Jika bukan di halaman login, arahkan ke login pengguna
      if (window.location.pathname !== '/login-pengguna' && window.location.pathname !== '/login-dokter') {
          window.location.href = '/login-pengguna';
      }
    } else {
      console.error("API Error:", error.response || error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;