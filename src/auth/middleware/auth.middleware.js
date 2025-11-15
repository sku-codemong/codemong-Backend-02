// src/auth/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

/** 내부 유틸: Authorization 헤더에서 Bearer 토큰 추출 */
const getBearerToken = (req) => {
  const auth = req.headers?.authorization ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
};

/** 내부 유틸: 헤더 우선, 필요 시 쿠키에서도 AT 읽기 */
const extractAccessToken = (
  req,
  { allowCookie = false, cookieName = "at" } = {}
) => {
  const fromHeader = getBearerToken(req);
  if (fromHeader) return fromHeader;
  if (allowCookie) return req.cookies?.[cookieName] ?? null;
  return null;
};

/**
 * **[Auth]**
 * **<🧱 Middleware>**
 * ***requireAuth***
 * '인증 필수' 미들웨어입니다.
 * Authorization 헤더(Bearer) 또는(옵션) 쿠키에서 Access Token(JWT)을 추출·검증하고,
 * 성공 시 `req.user = { id }`를 설정합니다. 실패하면 401을 반환합니다.
 * @param {object} [options] - { allowCookie?: boolean, cookieName?: string }
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void}
 */
export const requireAuth =
  (options = {}) =>
  (req, res, next) => {
    // requireAuth 맨 처음
    console.log("[AUTH] cookies keys =", Object.keys(req.cookies || {}));
    console.log("[AUTH] token from cookie =", req.cookies?.at?.slice(0, 20));

    const token = extractAccessToken(req, options);
    if (!token)
      return res.status(401).json({ message: "Missing access token" });
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const uid = payload?.sub ?? payload?.id; // ✅ 둘 다 대응
      if (!uid)
        return res
          .status(401)
          .json({ message: "Invalid access token payload" });
      req.user = { id: Number(uid) };
      console.log("[AUTH] req.user.id =", req.user.id); // 디버그
      return next();
    } catch {
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }
  };

/**
 * **[Auth]**
 * **<🧱 Middleware>**
 * ***optionalAuth***
 * '인증 선택' 미들웨어입니다.
 * 토큰이 있으면 검증 후 `req.user = { id }`를 설정하고,
 * 토큰이 없거나 검증에 실패해도 에러를 내지 않고 다음 미들웨어로 진행합니다.
 * 공개 엔드포인트에서 로그인 유무 분기가 필요할 때 사용합니다.
 * @param {object} [options] - { allowCookie?: boolean, cookieName?: string }
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void}
 */
export const optionalAuth =
  (options = {}) =>
  (req, res, next) => {
    const token = extractAccessToken(req, options);
    if (!token) return next();

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = { id: payload.sub };
    } catch {
      // 무시하고 비로그인 상태로 계속 진행
    }
    next();
  };

/**
 * **[Auth]**
 * **<🧱 Middleware>**
 * ***requireSelf***
 * '자기 리소스 접근' 보호 미들웨어입니다.
 * `requireAuth` 이후에 사용하며, 경로/바디/쿼리의 userId가 로그인한 사용자와 동일한지 검사합니다.
 * 다르면 403을 반환합니다.
 * @param {object} [options] - { from?: "params"|"body"|"query", key?: string }
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void}
 */
export const requireSelf =
  ({ from = "params", key = "userId" } = {}) =>
  (req, res, next) => {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const container =
      from === "body" ? req.body : from === "query" ? req.query : req.params;
    const targetRaw = container?.[key];
    const targetId =
      typeof targetRaw === "string" ? Number(targetRaw) : targetRaw;

    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({ message: "Invalid or missing user id" });
    }
    if (Number(req.user.id) !== Number(targetId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
