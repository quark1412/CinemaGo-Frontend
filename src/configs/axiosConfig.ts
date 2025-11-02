import axios, {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosInstance,
} from "axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import dayjs from "dayjs";

const baseURL = "http://localhost:8000/v1";

type CookieGetter = () => {
  accessToken?: string;
  refreshToken?: string;
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getClientCookies = (): {
  accessToken?: string;
  refreshToken?: string;
} => {
  return {
    accessToken: Cookies.get("accessToken"),
    refreshToken: Cookies.get("refreshToken"),
  };
};

const getServerCookies = async (): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> => {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const resolvedCookieStore =
      cookieStore instanceof Promise ? await cookieStore : cookieStore;
    return {
      accessToken: resolvedCookieStore.get("accessToken")?.value,
      refreshToken: resolvedCookieStore.get("refreshToken")?.value,
    };
  } catch (error) {
    return {};
  }
};

const createAxiosInstance = (cookieGetter?: CookieGetter): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(async (req: any) => {
    const requiresAuth = req.requiresAuth !== false;

    if (!requiresAuth) {
      return req;
    }

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (typeof window !== "undefined") {
      const cookies = getClientCookies();
      accessToken = cookies.accessToken;
      refreshToken = cookies.refreshToken;
    } else {
      if (cookieGetter) {
        const cookies = cookieGetter();
        accessToken = cookies.accessToken;
        refreshToken = cookies.refreshToken;
      } else {
        const cookies = await getServerCookies();
        accessToken = cookies.accessToken;
        refreshToken = cookies.refreshToken;
      }
    }

    if (accessToken) {
      try {
        const user = jwt_decode<{ exp: number }>(accessToken);
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

        if (!isExpired) {
          req.headers.Authorization = `Bearer ${accessToken}`;
          return req;
        }
      } catch (error) {}
    }

    if (refreshToken) {
      const isServer = typeof window === "undefined";

      if (isServer) {
        try {
          const response = await axios.post(
            `${baseURL}/auth/refreshToken`,
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken: newAccessToken } =
            response.data.data || response.data;

          req.headers.Authorization = `Bearer ${newAccessToken}`;
          return req;
        } catch (err) {
          return req;
        }
      } else {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const response = await axios.post(
              `${baseURL}/auth/refreshToken`,
              { refreshToken },
              { withCredentials: true }
            );

            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data.data || response.data;

            Cookies.set("accessToken", newAccessToken, { expires: 1 });
            Cookies.set("refreshToken", newRefreshToken, { expires: 7 });

            onRefreshed(newAccessToken);
            req.headers.Authorization = `Bearer ${newAccessToken}`;
            isRefreshing = false;
            return req;
          } catch (err) {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            isRefreshing = false;
            refreshSubscribers = [];

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return req;
          }
        } else {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              req.headers.Authorization = `Bearer ${token}`;
              resolve(req);
            });
          });
        }
      }
    }

    return req;
  });

  if (typeof window !== "undefined") {
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const cookies = getClientCookies();
          const refreshToken = cookies.refreshToken;

          if (refreshToken && !isRefreshing) {
            isRefreshing = true;

            try {
              const response = await axios.post(
                `${baseURL}/auth/refreshToken`,
                { refreshToken },
                { withCredentials: true }
              );

              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = response.data.data || response.data;

              Cookies.set("accessToken", newAccessToken, { expires: 1 });
              Cookies.set("refreshToken", newRefreshToken, { expires: 7 });

              onRefreshed(newAccessToken);
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              isRefreshing = false;

              return instance(originalRequest);
            } catch (err) {
              Cookies.remove("accessToken");
              Cookies.remove("refreshToken");
              isRefreshing = false;
              refreshSubscribers = [];

              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
              return Promise.reject(error);
            }
          } else if (isRefreshing) {
            return new Promise((resolve, reject) => {
              subscribeTokenRefresh((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return instance;
};

const instance = createAxiosInstance();

export const getServerAxiosInstance = (): AxiosInstance => {
  return createAxiosInstance();
};

export { createAxiosInstance };

export default instance;
