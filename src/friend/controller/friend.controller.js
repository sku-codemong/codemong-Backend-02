// src/friend/controller/friend.controller.js

import {
  SearchUsersRequestDTO,
  CreateFriendRequestRequestDTO,
  GetIncomingFriendRequestsRequestDTO,
  GetOutgoingFriendRequestsRequestDTO,
  RespondFriendRequestRequestDTO,
  GetFriendsRequestDTO,
  DeleteFriendRequestDTO,
} from "../dto/friend.request.dto.js";

import {
  searchUsers,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToFriendRequest,
  getFriends,
  deleteFriend,
} from "../service/friend.service.js";

/**
 * GET /api/users/search?keyword=...
 */
export const searchUsersController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const keyword = req.query.keyword;

    const dto = new SearchUsersRequestDTO({ currentUserId, keyword });
    const result = await searchUsers(dto);

    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/friends/requests
 * body: { target_user_id: number }
 */
export const sendFriendRequestController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { target_user_id } = req.body;

    const dto = new CreateFriendRequestRequestDTO({
      currentUserId,
      target_user_id,
    });

    const result = await sendFriendRequest(dto);
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends/requests/incoming
 */
export const getIncomingRequestsController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const dto = new GetIncomingFriendRequestsRequestDTO({ currentUserId });
    const result = await getIncomingRequests(dto);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends/requests/outgoing
 */
export const getOutgoingRequestsController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const dto = new GetOutgoingFriendRequestsRequestDTO({ currentUserId });
    const result = await getOutgoingRequests(dto);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/friends/requests/:id
 * body: { action: "accept" | "reject" }
 */
export const respondToFriendRequestController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;
    const { action } = req.body;

    const dto = new RespondFriendRequestRequestDTO({
      currentUserId,
      requestId,
      action,
    });

    const result = await respondToFriendRequest(dto);
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends
 */
export const getFriendsController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const dto = new GetFriendsRequestDTO({ currentUserId });
    const result = await getFriends(dto);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/friends/:friendUserId
 */
export const deleteFriendController = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const friendUserId = req.params.friendUserId;

    const dto = new DeleteFriendRequestDTO({ currentUserId, friendUserId });
    const result = await deleteFriend(dto);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};
