import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import dayjs from "dayjs";

const baseURL = "http://localhost:8000/v1";

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(async (req: any) => {
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");

  const requiresAuth = req.requiresAuth !== false;

  if (!requiresAuth) {
    return req;
  }

  if (accessToken) {
    const user = jwt_decode<{ exp: number }>(accessToken);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) {
      req.headers.Authorization = `Bearer ${accessToken}`;
      return req;
    }
  }

  try {
    const response = await axios.post(
      `${baseURL}/auth/refreshToken`,
      { refreshToken },
      { withCredentials: true }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data.data;

    Cookies.set("accessToken", newAccessToken);
    Cookies.set("refreshToken", newRefreshToken);

    req.headers.Authorization = `Bearer ${newAccessToken}`;
    return req;
  } catch (err) {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    return req;
  }
});

export default instance;
