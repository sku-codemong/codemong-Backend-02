/**
 * users 모델 → 내 프로필 응답 DTO로 변환
 */
export function toUserProfileDto(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    grade: user.grade,
    gender: user.gender, // "Male" | "Female" | null
    is_completed: user.is_completed,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
