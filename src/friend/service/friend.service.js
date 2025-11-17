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
  findUserProfileById,
  getSubjectsByUserId,
  getSessionsByUserAndRange,
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

    // 🔹 from_user / to_user 둘 다 들어있는 DTO
    const requestDto = toFriendRequestDto(req);

    // 🔔 WebSocket: 요청 보낸 사람(from_user)에게 결과 알림
    emitFriendRequestResponded(req.from_user_id, {
      type: "friend:request:responded",
      request_id: requestId,
      result: "accept",
      from_user: requestDto.from_user, // ✅ 요청 보낸 사람 정보
      to_user: requestDto.to_user, // ✅ 요청 받은 사람 정보
      // 필요하면 아래처럼 통째로 보내도 됨: request: requestDto
    });

    // HTTP 응답: 요청 처리한 사람(to_user) 입장에서는 친구 = from_user
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

/**
 * 친구 프로필 조회
 * @param {import("../dto/friend.request.dto.js").GetFriendProfileRequestDTO} dto
 */
export const getFriendProfile = async (dto) => {
  const { currentUserId, friendUserId } = dto;

  // 1. 자기 자신이면 그냥 내 프로필 API 쓰라고 막아도 되고, 허용해도 되고
  if (currentUserId === friendUserId) {
    return {
      ok: false,
      status: 400,
      error: "자기 자신의 프로필은 /api/user/me API를 사용해주세요.",
    };
  }

  // 2. 친구 관계인지 확인
  const isFriend = await isAlreadyFriend(currentUserId, friendUserId);
  if (!isFriend) {
    return {
      ok: false,
      status: 403,
      error: "친구가 아닌 사용자의 프로필은 조회할 수 없습니다.",
    };
  }

  // 3. 친구 유저 프로필 조회
  const user = await findUserProfileById(friendUserId);
  if (!user) {
    return {
      ok: false,
      status: 404,
      error: "해당 사용자를 찾을 수 없습니다.",
    };
  }

  return {
    ok: true,
    user: toUserSummaryDto(user),
  };
};

const toSubjectDto = (s) => ({
  id: s.id,
  name: s.name,
  color: s.color,
  target_daily_min: s.target_daily_min,
  credit: s.credit ? Number(s.credit) : null,
  difficulty: s.difficulty,
  weight: s.weight ? Number(s.weight) : 1.0,
  archived: s.archived,
  created_at:
    typeof s.created_at === "string"
      ? s.created_at
      : s.created_at.toISOString(),
  updated_at:
    typeof s.updated_at === "string"
      ? s.updated_at
      : s.updated_at.toISOString(),
});

/**
 * 친구 과목 목록 조회
 * @param {import("../dto/friend.request.dto.js").GetFriendSubjectsRequestDTO} dto
 */
export const getFriendSubjects = async (dto) => {
  const { currentUserId, friendUserId, includeArchived } = dto;

  if (currentUserId === friendUserId) {
    return {
      ok: false,
      status: 400,
      error: "자기 자신의 과목은 /api/subjects API를 사용해주세요.",
    };
  }

  // 친구 관계인지 확인
  const isFriend = await isAlreadyFriend(currentUserId, friendUserId);
  if (!isFriend) {
    return {
      ok: false,
      status: 403,
      error: "친구가 아닌 사용자의 과목은 조회할 수 없습니다.",
    };
  }

  const subjects = await getSubjectsByUserId(friendUserId, { includeArchived });

  return {
    ok: true,
    items: subjects.map(toSubjectDto),
  };
};

// 세션 응답 변환
const toSessionDto = (s) => ({
  id: s.id,
  subject: s.subject
    ? {
        id: s.subject.id,
        name: s.subject.name,
        color: s.subject.color,
      }
    : null,
  start_at:
    typeof s.start_at === "string" ? s.start_at : s.start_at.toISOString(),
  end_at: s.end_at
    ? typeof s.end_at === "string"
      ? s.end_at
      : s.end_at.toISOString()
    : null,
  duration_sec: s.duration_sec,
  source: s.source,
  status: s.status,
  note: s.note ?? null,
});

function getDayRange(dateStr) {
  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/**
 * 친구 세션 목록 조회 (특정 날짜)
 * @param {import("../dto/friend.request.dto.js").GetFriendSessionsRequestDTO} dto
 */
export const getFriendSessions = async (dto) => {
  const { currentUserId, friendUserId, date } = dto;

  if (!date) {
    return {
      ok: false,
      status: 400,
      error: "date 쿼리 파라미터가 필요합니다.",
    };
  }

  if (currentUserId === friendUserId) {
    return {
      ok: false,
      status: 400,
      error: "자기 자신의 세션은 /api/sessions API를 사용해주세요.",
    };
  }

  const isFriend = await isAlreadyFriend(currentUserId, friendUserId);
  if (!isFriend) {
    return {
      ok: false,
      status: 403,
      error: "친구가 아닌 사용자의 세션은 조회할 수 없습니다.",
    };
  }

  const { start, end } = getDayRange(date);
  const sessions = await getSessionsByUserAndRange(friendUserId, start, end);

  return {
    ok: true,
    items: sessions.map(toSessionDto),
  };
};
