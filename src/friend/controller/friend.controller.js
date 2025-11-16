// src/friend/controller/friend.controller.js

import {
  SearchUsersRequestDTO,
  CreateFriendRequestRequestDTO,
  GetIncomingFriendRequestsRequestDTO,
  GetOutgoingFriendRequestsRequestDTO,
  RespondFriendRequestRequestDTO,
  GetFriendsRequestDTO,
  DeleteFriendRequestDTO,
  GetFriendProfileRequestDTO,
  GetFriendSubjectsRequestDTO,
  GetFriendSessionsRequestDTO,
} from "../dto/friend.request.dto.js";

import {
  searchUsers,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToFriendRequest,
  getFriends,
  deleteFriend,
  getFriendProfile,
  getFriendSubjects,
  getFriendSessions,
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

/**
 * 친구 프로필 조회 컨트롤러
 * GET /api/friends/:friendUserId/profile
 */
export const getFriendProfileController = async (req, res, next) => {
  try {
    const dto = new GetFriendProfileRequestDTO({
      currentUserId: req.user.id,
      friendUserId: req.params.friendUserId,
    });

    const result = await getFriendProfile(dto);

    if (!result.ok) {
      return res.status(result.status ?? 400).json({
        ok: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 친구 과목 목록 조회 컨트롤러
 * GET /api/friends/:friendUserId/subjects
 */
export const getFriendSubjectsController = async (req, res, next) => {
  try {
    const dto = new GetFriendSubjectsRequestDTO({
      currentUserId: req.user.id,
      friendUserId: req.params.friendUserId,
      includeArchived: req.query.includeArchived,
    });

    const result = await getFriendSubjects(dto);

    if (!result.ok) {
      return res.status(result.status ?? 400).json({
        ok: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * 친구 세션 목록 조회 컨트롤러
 * GET /api/friends/:friendUserId/sessions
 */
export const getFriendSessionsController = async (req, res, next) => {
  try {
    const dto = new GetFriendSessionsRequestDTO({
      currentUserId: req.user.id,
      friendUserId: req.params.friendUserId,
      date: req.query.date,
    });

    const result = await getFriendSessions(dto);

    if (!result.ok) {
      return res.status(result.status ?? 400).json({
        ok: false,
        error: result.error,
      });
    }

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};
