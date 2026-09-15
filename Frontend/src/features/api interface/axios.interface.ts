import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.log("Status Code", error.response?.status);
      console.log("Response Data", error.response?.data);
    } else if (error.request) {
      console.log("No Request Response Received", error.request);
    }

    throw error;
  } else {
    console.error("Non-Axios Error:", error);
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh/token") &&
      !originalRequest.url?.includes("/auth/otp-verification") &&
      !originalRequest.url?.includes("/auth/resend/otp") &&
      !originalRequest.url?.includes("/auth/password-resets")
    ) {
      originalRequest._retry = true;

      try {
        await api.get("/auth/refresh/token");

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid. Redirecting to login...");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
