// src/friend/router/friend.router.js
import { Router } from "express";
import {
  searchUsersController,
  sendFriendRequestController,
  getIncomingRequestsController,
  getOutgoingRequestsController,
  respondToFriendRequestController,
  getFriendsController,
  deleteFriendController,
  getFriendProfileController,
  getFriendSubjectsController,
  getFriendSessionsController,
} from "../controller/friend.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: 친구 관리 API
 */

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: 친구 추가용 사용자 검색
 *     description: 이메일 또는 닉네임을 기준으로 친구 추가 대상 사용자를 검색합니다. 자기 자신은 결과에서 제외됩니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 이메일 또는 닉네임 검색 키워드
 *     responses:
 *       "200":
 *         description: 검색 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       email:
 *                         type: string
 *                         example: "friend@example.com"
 *                       nickname:
 *                         type: string
 *                         nullable: true
 *                         example: "친구1"
 *                       grade:
 *                         type: integer
 *                         nullable: true
 *                         example: 2
 *                       gender:
 *                         type: string
 *                         nullable: true
 *                         example: "Male"
 */
router.get("/users/search", searchUsersController);

/**
 * @swagger
 * /api/friends/requests:
 *   post:
 *     summary: 친구 요청 보내기
 *     description: 다른 사용자에게 친구 요청을 생성합니다. 이미 친구이거나 대기 중인 요청이 있으면 에러를 반환합니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target_user_id]
 *             properties:
 *               target_user_id:
 *                 type: integer
 *                 description: 친구 요청을 보낼 대상 유저 ID
 *                 example: 5
 *     responses:
 *       "201":
 *         description: 친구 요청 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 request:
 *                   type: object
 *                   description: 생성된 친구 요청 정보
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     from_user:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 1 }
 *                         email: { type: string, example: "me@example.com" }
 *                         nickname:
 *                           type: string
 *                           nullable: true
 *                           example: "나"
 *                     to_user:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 5 }
 *                         email: { type: string, example: "friend@example.com" }
 *                         nickname:
 *                           type: string
 *                           nullable: true
 *                           example: "친구1"
 *       "400":
 *         description: 잘못된 요청 (이미 친구, 자기 자신에게 요청 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "이미 친구인 사용자입니다."
 */
router.post("/friends/requests", sendFriendRequestController);

/**
 * @swagger
 * /api/friends/requests/incoming:
 *   get:
 *     summary: 받은 친구 요청 목록
 *     description: 현재 로그인한 사용자가 받은 대기 중(pending) 친구 요청 목록을 조회합니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       "200":
 *         description: 받은 친구 요청 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 11
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       from_user:
 *                         type: object
 *                         description: 친구 요청을 보낸 유저
 *                         properties:
 *                           id: { type: integer, example: 3 }
 *                           email: { type: string, example: "sender@example.com" }
 *                           nickname:
 *                             type: string
 *                             nullable: true
 *                             example: "보낸이"
 *                       to_user:
 *                         type: object
 *                         description: 현재 로그인 유저
 *                         properties:
 *                           id: { type: integer, example: 1 }
 *                           email: { type: string, example: "me@example.com" }
 *                           nickname:
 *                             type: string
 *                             nullable: true
 *                             example: "나"
 */
router.get("/friends/requests/incoming", getIncomingRequestsController);

/**
 * @swagger
 * /api/friends/requests/outgoing:
 *   get:
 *     summary: 보낸 친구 요청 목록
 *     description: 현재 로그인한 사용자가 보낸 대기 중(pending) 친구 요청 목록을 조회합니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       "200":
 *         description: 보낸 친구 요청 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       from_user:
 *                         type: object
 *                         description: 현재 로그인 유저
 *                         properties:
 *                           id: { type: integer, example: 1 }
 *                           email: { type: string, example: "me@example.com" }
 *                           nickname:
 *                             type: string
 *                             nullable: true
 *                             example: "나"
 *                       to_user:
 *                         type: object
 *                         description: 친구 요청을 받은 유저
 *                         properties:
 *                           id: { type: integer, example: 4 }
 *                           email: { type: string, example: "target@example.com" }
 *                           nickname:
 *                             type: string
 *                             nullable: true
 *                             example: "상대"
 */
router.get("/friends/requests/outgoing", getOutgoingRequestsController);

/**
 * @swagger
 * /api/friends/requests/{id}:
 *   patch:
 *     summary: 친구 요청 수락/거절
 *     description: 받은 친구 요청을 수락(accept)하거나 거절(reject)합니다. 요청을 받은 사용자만 처리할 수 있습니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 친구 요청 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 example: "accept"
 *     responses:
 *       "200":
 *         description: 처리 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: string
 *                   description: "처리 결과 (accept 또는 reject)"
 *                   example: "accept"
 *                 friend:
 *                   type: object
 *                   nullable: true
 *                   description: 친구로 추가된 유저 정보(accept일 때만 포함)
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     email:
 *                       type: string
 *                       example: "sender@example.com"
 *                     nickname:
 *                       type: string
 *                       nullable: true
 *                       example: "보낸이"
 *       "400":
 *         description: 잘못된 요청 또는 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "이미 처리된 요청입니다."
 */
router.patch("/friends/requests/:id", respondToFriendRequestController);

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: 친구 목록 조회
 *     description: 현재 로그인한 사용자의 친구 목록을 조회합니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       "200":
 *         description: 친구 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: friends 테이블 row id
 *                         example: 7
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       friend_user:
 *                         type: object
 *                         description: 친구 유저 정보
 *                         properties:
 *                           id: { type: integer, example: 4 }
 *                           email: { type: string, example: "friend@example.com" }
 *                           nickname:
 *                             type: string
 *                             nullable: true
 *                             example: "친구1"
 *                           grade:
 *                             type: integer
 *                             nullable: true
 *                             example: 2
 *                           gender:
 *                             type: string
 *                             nullable: true
 *                             example: "Female"
 */
router.get("/friends", getFriendsController);

/**
 * @swagger
 * /api/friends/{friendUserId}:
 *   delete:
 *     summary: 친구 삭제
 *     description: 특정 친구 관계를 삭제합니다. 양방향(friend↔me) 관계가 모두 삭제됩니다.
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 친구로 등록된 상대 유저 ID
 *     responses:
 *       "200":
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       "400":
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "삭제할 친구가 없습니다."
 */
router.delete("/friends/:friendUserId", deleteFriendController);

/**
 * @swagger
 * /api/friends/{friendUserId}/profile:
 *   get:
 *     summary: 친구 프로필 조회
 *     description: "친구 관계가 맺어진 사용자의 기본 프로필 정보를 조회합니다."
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 친구 유저 ID
 *     responses:
 *       "200":
 *         description: 친구 프로필 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 6
 *                     email:
 *                       type: string
 *                       example: "friend@example.com"
 *                     nickname:
 *                       type: string
 *                       nullable: true
 *                       example: "친구1"
 *                     grade:
 *                       type: integer
 *                       nullable: true
 *                       example: 3
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                       example: "Male"
 *       "403":
 *         description: 친구가 아닌 사용자에 대한 접근
 *       "404":
 *         description: 사용자를 찾을 수 없음
 */
router.get("/friends/:friendUserId/profile", getFriendProfileController);

/**
 * @swagger
 * /api/friends/{friendUserId}/subjects:
 *   get:
 *     summary: 친구 과목 목록 조회
 *     description: "친구 관계가 맺어진 사용자의 과목 목록을 조회합니다. 기본은 archived=false 과목만, includeArchived=true로 보관 과목도 포함할 수 있습니다."
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 친구 유저 ID
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           example: false
 *         description: 보관(archived) 과목 포함 여부
 *     responses:
 *       "200":
 *         description: 친구 과목 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
 *       "403":
 *         description: 친구가 아닌 사용자에 대한 접근
 *       "404":
 *         description: 사용자를 찾을 수 없음
 */
router.get("/friends/:friendUserId/subjects", getFriendSubjectsController);

/**
 * @swagger
 * /api/friends/{friendUserId}/sessions:
 *   get:
 *     summary: 친구 세션 목록 조회 (하루)
 *     description: "지정한 날짜(date)의 친구 세션 목록을 조회합니다."
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 친구 유저 ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-11-16"
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *     responses:
 *       "200":
 *         description: 세션 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       subject:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id: { type: integer }
 *                           name: { type: string }
 *                           color: { type: string, nullable: true }
 *                       start_at: { type: string, format: date-time }
 *                       end_at: { type: string, format: date-time, nullable: true }
 *                       duration_sec: { type: integer }
 *                       source: { type: string }
 *                       status: { type: string }
 *                       note: { type: string, nullable: true }
 *       "400":
 *         description: 잘못된 요청 (date 없음 등)
 *       "403":
 *         description: 친구가 아닌 사용자에 대한 접근
 */
router.get("/friends/:friendUserId/sessions", getFriendSessionsController);

export default router;
