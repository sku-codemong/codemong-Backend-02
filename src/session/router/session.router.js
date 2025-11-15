// src/session/router/session.router.js
import { Router } from "express";
import * as ctrl from "../controller/session.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: 공부 세션(Session) 기록 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 12 }
 *         user_id: { type: integer, example: 3 }
 *         subject_id: { type: integer, example: 5 }
 *         start_at: { type: string, format: date-time }
 *         end_at: { type: string, nullable: true, format: date-time }
 *         duration_sec: { type: integer, example: 1800 }
 *         source:
 *           type: string
 *           enum: [timer, manual]
 *           example: "timer"
 *         status:
 *           type: string
 *           enum: [running, stopped]
 *           example: "running"
 *         note:
 *           type: string
 *           nullable: true
 *           example: "오늘은 그리디 알고리즘 개념 정리함"
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     SessionResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         session:
 *           $ref: '#/components/schemas/Session'
 *
 *     SessionListResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         sessions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Session'
 */

/**
 * @swagger
 * /api/sessions/start:
 *   post:
 *     summary: 세션 시작
 *     description: "공부를 시작할 때 세션을 생성합니다. 시작 시간은 서버에서 자동 기록됩니다."
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_id]
 *             properties:
 *               subject_id:
 *                 type: integer
 *                 description: "공부한 과목 ID"
 *                 example: 4
 *     responses:
 *       "200":
 *         description: 생성된 세션
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 */
router.post("/start", ctrl.start);

/**
 * @swagger
 * /api/sessions/stop:
 *   post:
 *     summary: 세션 정지
 *     description: "진행 중인 세션을 종료하고 end_at과 duration_sec를 계산하여 저장합니다."
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [session_id]
 *             properties:
 *               session_id:
 *                 type: integer
 *                 description: "정지할 세션 ID"
 *                 example: 12
 *     responses:
 *       "200":
 *         description: 종료된 세션
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 */
router.post("/stop", ctrl.stop);

/**
 * @swagger
 * /api/sessions/manual:
 *   post:
 *     summary: 세션 수동 입력
 *     description: "직접 공부한 시간(start_at~end_at)을 입력하여 세션을 생성합니다. duration_sec은 서버에서 계산됩니다."
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject_id, start_at, end_at]
 *             properties:
 *               subject_id:
 *                 type: integer
 *                 description: "공부한 과목 ID"
 *                 example: 3
 *               start_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-14T09:00:00Z"
 *               end_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-14T10:30:00Z"
 *     responses:
 *       "200":
 *         description: 생성된 세션
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 */
router.post("/manual", ctrl.manual);

/**
 * @swagger
 * /api/sessions/{id}/note:
 *   patch:
 *     summary: 세션 학습 노트 저장/수정
 *     description: "특정 세션에 대한 학습 노트를 저장하거나 수정합니다."
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "노트를 저장할 세션 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note]
 *             properties:
 *               note:
 *                 type: string
 *                 example: "DP 기본 개념 복습하고 예제 3문제 품"
 *     responses:
 *       "200":
 *         description: 업데이트된 세션 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 */
router.patch("/:id/note", ctrl.updateNote);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: 특정 날짜의 세션 조회
 *     description: "로그인된 유저가 특정 날짜(YYYY-MM-DD)에 기록한 세션을 조회합니다."
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-11-14"
 *         description: 조회할 날짜(YYYY-MM-DD)
 *     responses:
 *       "200":
 *         description: 해당 날짜의 세션 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionListResponse'
 */
router.get("/", ctrl.list);

export default router;
