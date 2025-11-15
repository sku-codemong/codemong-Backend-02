// server.js (프로젝트 루트에 하나 생성)
import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import { initSocket } from "./src/socket/socket.js";

const PORT = Number(process.env.PORT ?? 4000);

const server = http.createServer(app);

// 🔹 여기서 socket.io 초기화
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
