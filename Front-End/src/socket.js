import { io } from "socket.io-client";

const socket = io("https://dental-clinic-monitoring-system.onrender.com", {
  transports: ["websocket"],      // Only websocket
  reconnection: true,             // Auto-reconnect
  reconnectionAttempts: 5,        // Max 5 attempts
  reconnectionDelay: 3000,        // 3s delay between attempts
  withCredentials: true,          // For cookies if needed
  secure: true                     // Ensure WSS (important sa production)
});

socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;
