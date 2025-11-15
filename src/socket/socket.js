// src/socket/socket.js
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { accessCookieName } from "../utils/cookies.js"; // ✅ 컨트롤러에서 쓰던 거 재사용

let io;

/**
 * HTTP 서버에 socket.io 붙이기
 */
export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: true,       // Netlify 프론트 도메인에서 접근 허용
      credentials: true,  // 쿠키 포함 허용
    },
  });

  // 🔐 WebSocket 인증 미들웨어
  io.use((socket, next) => {
    try {
      let token = null;

      // 1) handshake.auth.token 으로 들어오는 경우 (프론트에서 직접 넘길 때)
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // 2) Authorization: Bearer ... 헤더로 들어오는 경우
      if (!token) {
        const authHeader =
          socket.handshake.headers["authorization"] ||
          socket.handshake.headers["Authorization"];

        if (authHeader && typeof authHeader === "string") {
          if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim();
          }
        }
      }

      // 3) 쿠키로 들어오는 경우 (accessCookieName, 보통 "at")
      if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies[accessCookieName] || null;
      }

      if (!token) {
        return next(new Error("Missing access token"));
      }

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const uid = payload?.sub ?? payload?.id;

      if (!uid) {
        return next(new Error("Invalid access token payload"));
      }

      socket.user = { id: Number(uid) };

      return next();
    } catch (err) {
      console.error("[WS AUTH] error:", err.message);
      return next(new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 WebSocket connected: user=${userId}, socket=${socket.id}`);

    // 유저별 room에 join → user:123 이런 식
    const room = `user:${userId}`;
    socket.join(room);

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket disconnected: user=${userId}, socket=${socket.id}`);
    });
  });
}

/**
 * 친구 요청을 받은 유저에게 실시간 알림
 * @param {number} targetUserId
 * @param {object} payload
 */
export function emitFriendRequestReceived(targetUserId, payload) {
  if (!io) return;
  io.to(`user:${targetUserId}`).emit("friend:request:received", payload);
}

/**
 * 친구 요청 결과(수락/거절)를 요청 보낸 유저에게 알림
 * @param {number} targetUserId
 * @param {object} payload
 */
export function emitFriendRequestResponded(targetUserId, payload) {
  if (!io) return;
  io.to(`user:${targetUserId}`).emit("friend:request:responded", payload);
}
