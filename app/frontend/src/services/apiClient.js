import axios from "axios";

// central axios instance for API calls
const apiClient = axios.create({
  // baseURL: '', // optionally set if you have a common API base
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // also set global axios default to support modules importing axios directly
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    delete axios.defaults.headers.common["Authorization"];
  }
}

export default apiClient;
