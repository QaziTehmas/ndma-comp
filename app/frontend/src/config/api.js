// ChatBot base URLs
export const CHAT_BOT_BASE_URL = {
  local: "http://localhost:3000",
  onrender: "https://chat-bot-8yb9.onrender.com",
};

// AI Model API Base URL
export const INFO_SIDEBAR_BASE_URL = {
  local: "localhost:8000",
  onrender: "https://weathering-api.onrender.com/",
};

// Community API Base urls
const API_HOSTS = {
  local: "http://localhost:5555",
  onrender: "https://kartak-demo-od0f.onrender.com",
};

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" &&
    globalThis.process &&
    globalThis.process.env &&
    globalThis.process.env.REACT_APP_API_BASE) ||
  API_HOSTS.onrender;
export { API_HOSTS, API_BASE };

export default {
  API_HOSTS,
  API_BASE,
};
