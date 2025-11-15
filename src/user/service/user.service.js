import {
  findUserProfileById,
  updateUserProfileById,
} from "../repository/user.repository.js";

export async function getMyProfileService(userId) {
  const user = await findUserProfileById(userId);

  if (!userId) {
    const error = new Error("유저를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return user;
}

/**
 * 내 프로필 수정 서비스
 * - email은 DTO에서 이미 차단되어 들어온다고 가정
 */
export async function updateMyProfileService(userId, updateData) {
  const existing = await findUserProfileById(userId);

  if (!existing) {
    const error = new Error("유저를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  // 변경할 값이 하나도 없으면 그냥 기존값 리턴
  if (!updateData || Object.keys(updateData).length === 0) {
    return existing;
  }

  const updated = await updateUserProfileById(userId, updateData);
  return updated;
}
