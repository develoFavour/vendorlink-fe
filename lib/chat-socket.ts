import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/services/conversation.service";

let socket: Socket | null = null;

export const getChatSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  return socket;
};
