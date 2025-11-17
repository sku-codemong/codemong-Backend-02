// src/user/repository/user.repository.js
import { prisma } from "../../db.config.js";

// 공통 프로필 select
const userProfileSelect = {
  id: true,
  email: true,
  nickname: true,
  grade: true,
  gender: true,
  is_completed: true,
  profile_image_url: true, // ⭐ 추가
  created_at: true,
  updated_at: true,
};

/**
 * 유저 프로필 조회
 */
export async function findUserProfileById(userId) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });
}

/**
 * 유저 프로필 수정 (일반 정보 + 프로필 이미지 전부 여기로)
 */
export async function updateUserProfileById(userId, data) {
  return prisma.users.update({
    where: { id: userId },
    data,
    select: userProfileSelect, // 수정 후에 최신 프로필 리턴
  });
}
