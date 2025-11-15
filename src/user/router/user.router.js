// src/user/router/user.router.js
import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controller/user.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: 유저 관련 API
 *
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: "test@example.com"
 *         nickname:
 *           type: string
 *           nullable: true
 *           example: "현준"
 *         grade:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         gender:
 *           type: string
 *           nullable: true
 *           enum: [Male, Female]
 *         is_completed:
 *           type: boolean
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *
 *     UpdateUserProfileRequest:
 *       type: object
 *       description: 이메일은 수정할 수 없습니다.
 *       properties:
 *         nickname:
 *           type: string
 *           example: "새 닉네임"
 *         grade:
 *           type: integer
 *           example: 3
 *         gender:
 *           type: string
 *           enum: [Male, Female]
 *           example: "Female"
 *         is_completed:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     tags: [Users]
 *     summary: 내 프로필 조회
 *     description: 로그인된 유저의 프로필 정보를 조회합니다.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 내 프로필 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: 인증 실패 (토큰 없음/유효하지 않음)
 *       404:
 *         description: 유저를 찾을 수 없음
 */
router.get("/me", getMyProfile);

/**
 * @swagger
 * /api/user/me:
 *   patch:
 *     tags: [Users]
 *     summary: 내 프로필 수정
 *     description: 이메일은 수정할 수 없고, 닉네임/학년/성별/완료 여부만 변경할 수 있습니다.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: 수정된 프로필 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       400:
 *         description: 잘못된 요청 (이메일 변경 시도 등)
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 유저를 찾을 수 없음
 */
router.patch("/me", updateMyProfile);

export default router;
