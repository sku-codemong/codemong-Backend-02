// app.js (필요한 import 확인)
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { specs } from "../swagger/swagger.js";

import authRouter from "./auth/router/auth.router.js";
import subjectRouter from "./subject/router/subject.router.js";
import { requireAuth } from "./auth/middleware/auth.middleware.js";
import userRouter from "./user/router/user.router.js";
import subjectTasksRouter from "./subject-tasks/router/subject-tasks.router.js";
import sessionsRouter from "./session/router/session.router.js";
import sessionReportRouter from "./session/router/session.report.router.js";
import friendRouter from "./friend/router/friend.router.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Swagger (기존 코드 유지)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      swaggerOptions: { withCredentials: true },
    },
    customCss: `.swagger-ui .models { display: none !important; }`,
  })
);

// ✅ 라우트는 listen 위에!
app.use("/api/auth", authRouter);
app.use(
  "/api/subjects",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  subjectRouter
);
app.use(
  "/api/user",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  userRouter
);
app.use(
  "/api/subject-tasks",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  subjectTasksRouter
);
app.use(
  "/api/sessions",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  sessionsRouter
);
app.use(
  "/api/sessions",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  sessionReportRouter
);
app.use(
  "/api",
  requireAuth({ allowCookie: true, cookieName: "at" }),
  friendsRouter
);
// ✅ 마지막에 서버 시작
app.listen(PORT, () => {
  console.log(`서버 열림 - 포트 : ${PORT}`);
});

export default app;
