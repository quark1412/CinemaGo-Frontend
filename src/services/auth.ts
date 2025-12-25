import instance from "@/configs/axiosConfig";
import axios from "axios";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`/api/auth/login`, {
      email,
      password,
    });
    return response;
  },

  saveToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },

  signup: async (
    email: string,
    fullname: string,
    password: string,
    gender: string
  ) => {
    try {
      const response = await instance.post(`/v1/auth/signup`, {
        email,
        fullname,
        password,
        gender,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`/api/auth/logout`);
    } finally {
      // Always remove accessToken from localStorage, even if logout API call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    }
  },

  getProfile: async (token?: string) => {
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;
      const response = await instance.get(`/v1/users/profile`, config);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (
    data: FormData | { fullname: string; gender: string }
  ) => {
    try {
      const response = await instance.put(`/v1/users/profile`, data, {
        headers:
          data instanceof FormData
            ? {
              "Content-Type": "multipart/form-data",
            }
            : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await instance.post(`/v1/auth/change-password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  isAuthenticated: () => {
    if (typeof window === "undefined") {
      return false;
    }
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  },
};
