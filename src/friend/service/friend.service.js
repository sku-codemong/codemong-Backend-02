// src/friend/service/friend.service.js

import {
  searchUsersByKeyword,
  findFriendRequestBetween,
  createFriendRequest,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  findFriendRequestById,
  updateFriendRequestStatus,
  isAlreadyFriend,
  createFriendsForBoth,
  getFriendsByUserId,
  deleteFriendBothSides,
} from "../repository/friend.repository.js";

// 🔔 WebSocket 이벤트 import
import {
  emitFriendRequestReceived,
  emitFriendRequestResponded,
} from "../../socket/socket.js";

/**
 * ===== Response용 Mapper =====
 */

const toUserSummaryDto = (user) => ({
  id: user.id,
  email: user.email,
  nickname: user.nickname,
  grade: user.grade ?? null,
  gender: user.gender ?? null,
});

const toFriendRequestDto = (req) => ({
  id: req.id,
  status: req.status,
  created_at:
    typeof req.created_at === "string"
      ? req.created_at
      : req.created_at.toISOString(),
  from_user: toUserSummaryDto(req.from_user),
  to_user: toUserSummaryDto(req.to_user),
});

const toFriendDto = (friendRow) => ({
  id: friendRow.id,
  created_at:
    typeof friendRow.created_at === "string"
      ? friendRow.created_at
      : friendRow.created_at.toISOString(),
  friend_user: toUserSummaryDto(friendRow.friend_user),
});

/**
 * 유저 검색
 * @param {import("../dto/friend.request.dto.js").SearchUsersRequestDTO} dto
 */
export const searchUsers = async (dto) => {
  const users = await searchUsersByKeyword(dto.keyword, dto.currentUserId);
  return {
    ok: true,
    users: users.map(toUserSummaryDto),
  };
};

/**
 * 친구 요청 보내기
 * @param {import("../dto/friend.request.dto.js").CreateFriendRequestRequestDTO} dto
 */
export const sendFriendRequest = async (dto) => {
  const { currentUserId, target_user_id } = dto;

  if (currentUserId === target_user_id) {
    return {
      ok: false,
      error: "자기 자신에게는 친구 요청을 보낼 수 없습니다.",
    };
  }

  // 이미 친구인지 체크
  const alreadyFriend = await isAlreadyFriend(currentUserId, target_user_id);
  if (alreadyFriend) {
    return {
      ok: false,
      error: "이미 친구인 사용자입니다.",
    };
  }

  // 내가 보낸 pending 요청이 이미 있는지 체크
  const existing = await findFriendRequestBetween(
    currentUserId,
    target_user_id
  );
  if (existing && existing.status === "pending") {
    return {
      ok: false,
      error: "이미 보낸 친구 요청이 있습니다.",
    };
  }

  const created = await createFriendRequest(currentUserId, target_user_id);
  const requestDto = toFriendRequestDto(created);

  // 🔔 WebSocket: 친구 요청 받은 사람에게 알림 (target_user_id)
  emitFriendRequestReceived(target_user_id, {
    type: "friend:request:received",
    request: requestDto,
  });

  return {
    ok: true,
    request: requestDto,
  };
};

/**
 * 받은 친구 요청 목록
 * @param {import("../dto/friend.request.dto.js").GetIncomingFriendRequestsRequestDTO} dto
 */
export const getIncomingRequests = async (dto) => {
  const list = await getIncomingFriendRequests(dto.currentUserId);
  return {
    ok: true,
    requests: list.map(toFriendRequestDto),
  };
};

/**
 * 보낸 친구 요청 목록
 * @param {import("../dto/friend.request.dto.js").GetOutgoingFriendRequestsRequestDTO} dto
 */
export const getOutgoingRequests = async (dto) => {
  const list = await getOutgoingFriendRequests(dto.currentUserId);
  return {
    ok: true,
    requests: list.map(toFriendRequestDto),
  };
};

/**
 * 친구 요청 수락/거절
 * @param {import("../dto/friend.request.dto.js").RespondFriendRequestRequestDTO} dto
 */
export const respondToFriendRequest = async (dto) => {
  const { currentUserId, requestId, action } = dto;

  const req = await findFriendRequestById(requestId);
  if (!req) {
    return { ok: false, error: "해당 친구 요청을 찾을 수 없습니다." };
  }

  // 받은 사람만 처리 가능
  if (req.to_user_id !== currentUserId) {
    return { ok: false, error: "해당 요청을 처리할 권한이 없습니다." };
  }

  if (req.status !== "pending") {
    return { ok: false, error: "이미 처리된 요청입니다." };
  }

  if (action === "accept") {
    // 상태 업데이트 + 친구 관계 생성
    await updateFriendRequestStatus(requestId, "accepted");
    await createFriendsForBoth(req.from_user_id, req.to_user_id);

    // 🔔 WebSocket: 요청 보낸 사람(from_user)에게 결과 알림
    emitFriendRequestResponded(req.from_user_id, {
      type: "friend:request:responded",
      request_id: requestId,
      result: "accept",
      friend: {
        id: req.to_user.id,
        nickname: req.to_user.nickname,
        email: req.to_user.email,
      },
    });

    // HTTP 응답: 요청 처리한 사람(to_user) 입장에서는 친구=from_user
    return {
      ok: true,
      result: "accept",
      friend: {
        id: req.from_user.id,
        nickname: req.from_user.nickname,
        email: req.from_user.email,
      },
    };
  }

  if (action === "reject") {
    await updateFriendRequestStatus(requestId, "rejected");

    // 🔔 WebSocket: 요청 보낸 사람에게 거절 알림
    emitFriendRequestResponded(req.from_user_id, {
      type: "friend:request:responded",
      request_id: requestId,
      result: "reject",
    });

    return {
      ok: true,
      result: "reject",
    };
  }

  return { ok: false, error: "올바르지 않은 action 값입니다." };
};

/**
 * 친구 목록 조회
 * @param {import("../dto/friend.request.dto.js").GetFriendsRequestDTO} dto
 */
export const getFriends = async (dto) => {
  const rows = await getFriendsByUserId(dto.currentUserId);
  return {
    ok: true,
    friends: rows.map(toFriendDto),
  };
};

/**
 * 친구 삭제
 * @param {import("../dto/friend.request.dto.js").DeleteFriendRequestDTO} dto
 */
export const deleteFriend = async (dto) => {
  await deleteFriendBothSides(dto.currentUserId, dto.friendUserId);
  return { ok: true };
};
