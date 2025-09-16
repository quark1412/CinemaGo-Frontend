import axios from "axios";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.API_URL}/auth/login`, {
        email,
        password,
      });
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
      const response = await axios.post(`${process.env.API_URL}/auth/signup`, {
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
};
