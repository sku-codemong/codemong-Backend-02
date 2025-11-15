import { prisma } from "../../db.config.js";

/** 
 * 유저 프로필 조회
*/
export async function findUserProfileById(userId) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nickname: true,
      grade: true,
      gender: true,
      is_completed: true,
      created_at: true,
      updated_at: true,
    },
  });
}

/**
 * 유저 프로필 수정
 */
export async function updateUserProfileById(userId, data) {
  return prisma.users.update({
    where: { id: userId },
    data,
  });
}
