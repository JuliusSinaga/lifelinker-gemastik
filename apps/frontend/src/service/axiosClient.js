import axios from "axios";

const baseURL = "https://lifelinker-backend-juliussinaga1377-dpuh4op8.leapcell.dev";

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Opsional: Interceptor untuk menangani error response secara global
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;