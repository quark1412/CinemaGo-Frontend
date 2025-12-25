import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    const accessToken = localStorage.getItem("accessToken");

    if (socket && !socket.connected) {
      socket.disconnect();
      socket = null;
    }

    if (!socket) {
      socket = io("http://localhost:8000", {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        withCredentials: true,
        auth: accessToken
          ? {
              token: accessToken,
            }
          : undefined,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.log("Socket connection error:", error);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
      });
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
