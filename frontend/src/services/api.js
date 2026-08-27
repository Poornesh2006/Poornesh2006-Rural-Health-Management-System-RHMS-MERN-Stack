import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("rhms-access-token");
  const facilityId = window.localStorage.getItem("rhms-active-facility-id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (facilityId) {
    config.headers["x-facility-id"] = facilityId;
  }

  return config;
});
