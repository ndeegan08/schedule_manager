// src/api/auth.js
import api from "./axios"; // Reusable Axios instance

// POST: /login
export const login = async (email, password) => {
  const res = await api.post("/login", { email, password });
  return res.data;
};

// POST: /register
export const register = async (formData) => {
  const res = await api.post("/register", formData);
  return res.data;
};

// GET: /protected
export const getProtectedData = async () => {
  const res = await api.get("/protected");
  return res.data;
};
