import { logout } from "@/state/redux/slices/authSlice";
import { store } from "@/state/redux/store";
import { io, Socket } from "socket.io-client";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL;

let ticTacToeSocket: Socket | null = null;

export const getTicTacToeSocket = (): Socket => {
  if (!ticTacToeSocket) {
    const accessToken = store.getState().auth.accessToken;
    if (!accessToken) {
      console.warn(
        "Attempted to create Socket.IO Tic Tac Toe connection without access token."
      );
      throw new Error("No access token available for WebSocket connection.");
    }

    ticTacToeSocket = io(`${WS_BASE_URL}/tic-tac-toe`, {
      // Kết nối tới namespace /tic-tac-toe
      transports: ["websocket"],
      auth: {
        token: accessToken,
      },
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    ticTacToeSocket.on("connect", () => {
      console.log("Socket.IO Tic Tac Toe Connected:", ticTacToeSocket?.id);
    });

    ticTacToeSocket.on("disconnect", (reason) => {
      console.log("Socket.IO Tic Tac Toe Disconnected:", reason);
      if (reason === "io server disconnect") {
        console.warn(
          "Server disconnected Tic Tac Toe socket. Token might be invalid or expired."
        );
        store.dispatch(logout());
        // window.location.href = '/login'; // Có thể chuyển hướng
      }
    });

    ticTacToeSocket.on("connect_error", (error) => {
      console.error("Socket.IO Tic Tac Toe Connection Error:", error);
      if (error.message.includes("Unauthorized")) {
        console.warn(
          "Unauthorized WebSocket connection. Token invalid or missing."
        );
        store.dispatch(logout());
        // window.location.href = '/login';
      }
    });
  }
  return ticTacToeSocket;
};
export const closeTicTacToeSocket = () => {
  if (ticTacToeSocket) {
    ticTacToeSocket.disconnect();
    ticTacToeSocket = null;
    console.log("Socket.IO Tic Tac Toe Disconnected and cleared.");
  }
};
