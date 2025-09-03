import axios from "axios";

const api = axios.create({
  // Set the base URL from your environment variables
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // Set default headers for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
