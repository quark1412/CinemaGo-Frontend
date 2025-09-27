import instance from "@/configs/axiosConfig";
import Cookies from "js-cookie";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await instance.post(`/auth/login`, {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;

      Cookies.set("accessToken", accessToken, { expires: 1 });
      Cookies.set("refreshToken", refreshToken, { expires: 7 });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  signup: async (
    email: string,
    fullname: string,
    password: string,
    gender: string
  ) => {
    try {
      const response = await instance.post(`/auth/signup`, {
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
      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        await instance.post(`/auth/logout`, { refreshToken });
      }

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      return { message: "Logged out successfully" };
    } catch (error) {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await instance.get(`/users/profile`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (
    data: FormData | { fullname: string; gender: string }
  ) => {
    try {
      const response = await instance.put(`/users/profile`, data, {
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
      const response = await instance.post(`/auth/change-password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  isAuthenticated: () => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    return !!(accessToken || refreshToken);
  },
};
