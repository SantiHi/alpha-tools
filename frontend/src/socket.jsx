import { io } from "socket.io-client";
import { BASE_URL } from "./lib/utils";

export const socket = io(BASE_URL, {
  withCredentials: true,
});
