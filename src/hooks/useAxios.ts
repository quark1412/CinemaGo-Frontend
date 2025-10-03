// "use client";

// import { useEffect } from "react";
// import api from "@/lib/api";
// import { useAuth } from "@/contexts/UserContext";

// const useAxios = () => {
//   const { accessToken, refreshToken, setAccessToken, logout } = useAuth();

//   useEffect(() => {
//     // Request interceptor: attach access token
//     const reqInterceptor = api.interceptors.request.use(
//       (config) => {
//         if (accessToken) {
//           config.headers.Authorization = `Bearer ${accessToken}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Response interceptor: refresh if token expired
//     const resInterceptor = api.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;

//         // Token expired → try refresh
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;
//           try {
//             const res = await api.post("/auth/refresh", {
//               token: refreshToken,
//             });

//             const newAccessToken = res.data.accessToken;
//             setAccessToken(newAccessToken);

//             // retry original request with new token
//             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//             return api(originalRequest);
//           } catch (err) {
//             // refresh failed → logout
//             logout();
//             return Promise.reject(err);
//           }
//         }

//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       api.interceptors.request.eject(reqInterceptor);
//       api.interceptors.response.eject(resInterceptor);
//     };
//   }, [accessToken, refreshToken, setAccessToken, logout]);

//   return api;
// };

// export default useAxios;
