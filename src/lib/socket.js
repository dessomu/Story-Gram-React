import { io } from "socket.io-client";

const socket = io("http://localhost:3009", {
  transports: ["websocket"],
});

export default socket;
