// src/subject/router/subject.router.js
import { Router } from "express";
import * as ctrl from "../controller/subject.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: 과목(Subject) 관리 API
 */

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: 과목 생성
 *     description: "로그인된 유저의 새로운 과목을 생성합니다. credit(학점), difficulty(난이도: 1~5) 등을 기반으로 weight(가중치)가 자동 계산됩니다."
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "자료구조"
 *               color:
 *                 type: string
 *                 example: "#7C3AED"
 *               target_daily_min:
 *                 type: integer
 *                 description: 하루 목표 공부 시간(분)
 *                 example: 60
 *               credit:
 *                 type: number
 *                 format: float
 *                 example: 3.0
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: "난이도(1=매우 쉬움, 2=쉬움, 3=보통, 4=어려움, 5=매우 어려움)"
 *                 example: 3
 *     responses:
 *       "201":
 *         description: 생성된 과목
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 */
router.post("/", ctrl.createSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   patch:
 *     summary: 과목 수정
 *     description: "과목 정보를 수정하고, credit/difficulty 변경 시 weight를 자동 재계산합니다."
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "운영체제"
 *               color:
 *                 type: string
 *                 example: "#10B981"
 *               target_daily_min:
 *                 type: integer
 *                 description: 하루 목표 공부 시간(분)
 *                 example: 45
 *               credit:
 *                 type: number
 *                 format: float
 *                 example: 3.0
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: "난이도(1=매우 쉬움, 2=쉬움, 3=보통, 4=어려움, 5=매우 어려움)"
 *                 example: 4
 *     responses:
 *       "200":
 *         description: 수정된 과목
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 */
router.patch("/:id", ctrl.updateSubject);

/**
 * @swagger
 * /api/subjects/{id}/archive:
 *   patch:
 *     summary: 과목 보관/복구
 *     description: 과목을 보관(archived=true)하거나 복구(archived=false)합니다. 복구 시 weight가 자동 재계산됩니다.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [archived]
 *             properties:
 *               archived:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       "200":
 *         description: 변경된 과목 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 */
router.patch("/:id/archive", ctrl.archiveSubject);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: 과목 단건 조회
 *     description: ID로 특정 과목을 조회합니다.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: 조회 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 */
router.get("/:id", ctrl.getSubjectById);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: 과목 목록 조회
 *     description: 로그인된 유저의 과목 목록을 검색/페이징 조건으로 조회합니다. 기본은 archived=false이며, includeArchived=true로 보관 과목도 포함할 수 있습니다.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: 과목명 검색(부분일치, 대소문자 무시)
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           example: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: 과목 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectResponse'
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 */
router.get("/", ctrl.listSubjects);

export default router;
