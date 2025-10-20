import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

export const loginUser = async (credentials) => {
  return await axios.post(`${BASE_URL}/login`, credentials);
};

export const registerUser = async (data) => {
  return await axios.post(`${BASE_URL}/register`, data);
};
