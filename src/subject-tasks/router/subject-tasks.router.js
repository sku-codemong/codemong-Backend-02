// src/subject/subject-tasks/router/subject-tasks.router.js
import { Router } from "express";
import * as ctrl from "../controller/subject-tasks.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: SubjectTasks
 *   description: 과제(Subject Task) 관리 API
 */

/**
 * @swagger
 * /api/subject-tasks:
 *   post:
 *     summary: 과제 생성
 *     description: "로그인된 유저의 과제를 생성합니다. subject_id를 지정하지 않으면 과목과 연결되지 않은 일반 작업으로 저장됩니다."
 *     tags: [SubjectTasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               subject_id:
 *                 type: integer
 *                 nullable: true
 *                 description: 연결할 과목 ID (없으면 null)
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "알고리즘 과제 1"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "교재 3장 연습문제 1~5번 풀이"
 *               due_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-11-20T23:59:00.000Z"
 *               estimated_min:
 *                 type: integer
 *                 nullable: true
 *                 description: 예상 소요 시간(분)
 *                 example: 90
 *     responses:
 *       "201":
 *         description: 생성된 과제
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectTaskResponse'
 */
router.post("/", ctrl.createSubjectTask);

/**
 * @swagger
 * /api/subject-tasks/{id}:
 *   patch:
 *     summary: 과제 수정
 *     description: "과제 정보를 수정합니다. status를 변경하여 진행 상태(todo, in_progress, done)를 갱신할 수 있습니다."
 *     tags: [SubjectTasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 과제 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_id:
 *                 type: integer
 *                 nullable: true
 *                 description: 연결할 과목 ID (null이면 연결 해제)
 *                 example: 2
 *               title:
 *                 type: string
 *                 example: "알고리즘 과제 1 (수정)"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "3장 연습문제 1~10번까지 풀기"
 *               due_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-11-21T23:59:00.000Z"
 *               estimated_min:
 *                 type: integer
 *                 nullable: true
 *                 description: 예상 소요 시간(분)
 *                 example: 120
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 example: "in_progress"
 *     responses:
 *       "200":
 *         description: 수정된 과제
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectTaskResponse'
 */
router.patch("/:id", ctrl.updateSubjectTask);

/**
 * @swagger
 * /api/subject-tasks/{id}:
 *   get:
 *     summary: 과제 단건 조회
 *     description: ID로 특정 과제를 조회합니다.
 *     tags: [SubjectTasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 과제 ID
 *     responses:
 *       "200":
 *         description: 조회 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectTaskResponse'
 */
router.get("/:id", ctrl.getSubjectTaskById);

/**
 * @swagger
 * /api/subject-tasks:
 *   get:
 *     summary: 과제 목록 조회
 *     description: "로그인된 유저의 과제 목록을 조회합니다. 과목, 상태로 필터링할 수 있습니다."
 *     tags: [SubjectTasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *         description: 해당 과목에 속한 과제만 조회
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         description: 과제 상태로 필터링
 *     responses:
 *       "200":
 *         description: 과제 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectTask'
 */
router.get("/", ctrl.getSubjectTasks);

/**
 * @swagger
 * /api/subject-tasks/{id}:
 *   delete:
 *     summary: 과제 삭제
 *     description: "특정 과제를 삭제합니다."
 *     tags: [SubjectTasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 과제 ID
 *     responses:
 *       "204":
 *         description: 삭제 성공 (본문 없음)
 */
router.delete("/:id", ctrl.deleteSubjectTask);

export default router;
