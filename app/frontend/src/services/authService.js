import axios from "axios";
import { API_BASE } from "../config/api";

const BASE = `${API_BASE}/api/auth`;

export async function loginApi(payload) {
  const { data } = await axios.post(`${BASE}/login`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function registerApi(payload) {
  const { data } = await axios.post(`${BASE}/register`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function logoutApi(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const { data } = await axios.post(`${BASE}/logout`, {}, { headers });
  return data;
}
