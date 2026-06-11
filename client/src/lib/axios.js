// src/lib/axios.js
// Central axios instance — uses VITE_API_URL in production, falls back to relative paths in dev
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: false,
});

export default instance;
