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
} from "../controller/friend.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: 친구 관리 API
 */

router.get("/users/search", searchUsersController);
router.post("/friends/requests", sendFriendRequestController);
router.get("/friends/requests/incoming", getIncomingRequestsController);
router.get("/friends/requests/outgoing", getOutgoingRequestsController);
router.patch("/friends/requests/:id", respondToFriendRequestController);
router.get("/friends", getFriendsController);
router.delete("/friends/:friendUserId", deleteFriendController);

export default router;
