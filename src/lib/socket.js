import { io } from "socket.io-client";

const socket = io("https://story-gram-server.onrender.com/", {
  transports: ["websocket"],
});

export default socket;
