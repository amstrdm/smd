import axios from "axios";

const api = axios.create({
  // Remove the static baseURL from here
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to dynamically set the baseURL
api.interceptors.request.use(
  (config) => {
    const serverUrl = localStorage.getItem("serverUrl");

    if (serverUrl) {
      // Set the baseURL for the outgoing request
      config.baseURL = serverUrl;
    } else {
      // Optional: Prevent requests if no URL is set
      console.warn(
        "API server URL is not set. Please configure it in settings."
      );
      // You could throw an error to cancel the request
      // return Promise.reject(new Error("API server URL is not set."));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
