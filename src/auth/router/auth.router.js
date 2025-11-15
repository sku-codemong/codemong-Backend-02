// src/auth/auth.routes.js
import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 12 }
 *         name: { type: string, example: "자료구조" }
 *         color: { type: string, nullable: true, example: "#7C3AED" }
 *         target_weekly_min: { type: integer, example: 300 }
 *         weight: { type: number, example: 1.25 }
 *         archived: { type: boolean, example: false }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     SubjectResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         subject:
 *           $ref: '#/components/schemas/Subject'
 *
 *     SubjectListResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/Subject' }
 *         nextCursor:
 *           type: integer
 *           nullable: true
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: 인증/인가 API
 *
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     CookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: access_token
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, name]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: P@ssw0rd!
 *         name:
 *           type: string
 *           example: 홍길동
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: P@ssw0rd!
 *     TokenPair:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: 액세스 토큰(JWT)
 *         refreshToken:
 *           type: string
 *           description: 리프레시 토큰(JWT)
 *       example:
 *         accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "usr_123"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "홍길동"
 *     AuthSuccessResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         tokens:
 *           $ref: '#/components/schemas/TokenPair'
 *     RefreshRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: (선택) 쿠키 미사용 시 body로 전달
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: 잘못된 요청(중복 이메일 등)
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 *     description: 성공 시 액세스/리프레시 토큰을 반환(또는 httpOnly 쿠키로 세팅)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: 선택 — access_token, refresh_token 쿠키 설정
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: 인증 실패
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 토큰 재발급
 *     description: 기본적으로 쿠키의 refresh_token 사용, 없으면 body.refreshToken 사용 가능
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 tokens:
 *                   $ref: '#/components/schemas/TokenPair'
 *       401:
 *         description: 유효하지 않은 refresh token
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 로그아웃
 *     description: 서버 세션 무효화 또는 토큰 쿠키 만료 처리
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: 선택 — access_token/refresh_token 쿠키 만료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
router.post("/logout", logout);
router.get("/protected/ping", requireAuth(), (req, res) => {
  res.json({ ok: true, userId: req.user.id });
});

export default router;
