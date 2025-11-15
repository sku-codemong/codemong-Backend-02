// src/friend/repository/friend.repository.js
import { prisma } from "../../db.config.js";

/**
 * 유저 검색 (친구 추가용)
 * @param {string} keyword
 * @param {number} excludeUserId
 */
export const searchUsersByKeyword = async (keyword, excludeUserId) => {
  if (!keyword || keyword.trim() === "") return [];

  return prisma.users.findMany({
    where: {
      AND: [
        {
          OR: [
            { email: { contains: keyword, mode: "insensitive" } },
            { nickname: { contains: keyword, mode: "insensitive" } },
          ],
        },
        { id: { not: excludeUserId } },
      ],
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      grade: true,
      gender: true,
    },
    take: 20,
  });
};

/**
 * 특정 두 유저 사이의 친구 요청 조회
 */
export const findFriendRequestBetween = (fromUserId, toUserId) => {
  return prisma.friend_requests.findFirst({
    where: {
      from_user_id: fromUserId,
      to_user_id: toUserId,
    },
  });
};

/**
 * 친구 요청 생성
 */
export const createFriendRequest = (fromUserId, toUserId) => {
  return prisma.friend_requests.create({
    data: {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      status: "pending",
    },
    include: {
      from_user: true,
      to_user: true,
    },
  });
};

/**
 * 받은 친구 요청 목록 (to_user_id = me, status = pending)
 */
export const getIncomingFriendRequests = (userId) => {
  return prisma.friend_requests.findMany({
    where: {
      to_user_id: userId,
      status: "pending",
    },
    include: {
      from_user: true,
      to_user: true,
    },
    orderBy: { created_at: "desc" },
  });
};

/**
 * 보낸 친구 요청 목록 (from_user_id = me, status = pending)
 */
export const getOutgoingFriendRequests = (userId) => {
  return prisma.friend_requests.findMany({
    where: {
      from_user_id: userId,
      status: "pending",
    },
    include: {
      from_user: true,
      to_user: true,
    },
    orderBy: { created_at: "desc" },
  });
};

/**
 * 요청 ID로 가져오기 (권한 체크 위해)
 */
export const findFriendRequestById = (requestId) => {
  return prisma.friend_requests.findUnique({
    where: { id: requestId },
    include: {
      from_user: true,
      to_user: true,
    },
  });
};

/**
 * 친구 요청 상태 업데이트
 */
export const updateFriendRequestStatus = (requestId, status) => {
  return prisma.friend_requests.update({
    where: { id: requestId },
    data: { status },
  });
};

/**
 * 이미 친구인지 확인
 */
export const isAlreadyFriend = (userId, friendUserId) => {
  return prisma.friends.findFirst({
    where: {
      user_id: userId,
      friend_user_id: friendUserId,
    },
  });
};

/**
 * 친구 관계 두 줄 생성 (양방향)
 */
export const createFriendsForBoth = async (userId, friendUserId) => {
  return prisma.$transaction(async (tx) => {
    const f1 = await tx.friends.create({
      data: {
        user_id: userId,
        friend_user_id: friendUserId,
      },
    });

    const f2 = await tx.friends.create({
      data: {
        user_id: friendUserId,
        friend_user_id: userId,
      },
    });

    return [f1, f2];
  });
};

/**
 * 친구 목록 조회
 */
export const getFriendsByUserId = (userId) => {
  return prisma.friends.findMany({
    where: {
      user_id: userId,
    },
    include: {
      friend_user: true,
    },
    orderBy: { created_at: "desc" },
  });
};

/**
 * 친구 삭제 (양방향 모두 제거)
 */
export const deleteFriendBothSides = async (userId, friendUserId) => {
  return prisma.$transaction(async (tx) => {
    await tx.friends.deleteMany({
      where: {
        OR: [
          { user_id: userId, friend_user_id: friendUserId },
          { user_id: friendUserId, friend_user_id: userId },
        ],
      },
    });
  });
};
