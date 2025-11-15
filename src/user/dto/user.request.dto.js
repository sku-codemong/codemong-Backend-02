// src/user/dto/user.request.dto.js

/**
 * 내 프로필 수정 요청 DTO
 * - 이메일 수정은 막음 (body에 email 있으면 400 에러)
 * - nickname / grade / gender / is_completed만 허용
 */
export function parseUpdateProfileRequest(body) {
  // 1) 이메일 변경 시도 막기
  if ("email" in body) {
    const err = new Error("이메일은 변경할 수 없습니다.");
    err.status = 400;
    throw err;
  }

  const updateData = {};

  // 2) 닉네임
  if (typeof body.nickname === "string") {
    const trimmed = body.nickname.trim();
    if (trimmed.length > 0) {
      updateData.nickname = trimmed;
    } else {
      // 빈 문자열이면 null/undefined 처리 (원하면 에러로 바꿔도 됨)
      updateData.nickname = null;
    }
  }

  // 3) 학년 (grade) - 숫자로 파싱
  if (body.grade !== undefined) {
    const num = Number(body.grade);
    if (Number.isNaN(num) || !Number.isInteger(num) || num < 0) {
      const err = new Error("grade 값이 올바르지 않습니다.");
      err.status = 400;
      throw err;
    }
    updateData.grade = num;
  }

  // 4) 성별 (gender) - enum 체크
  if (body.gender !== undefined) {
    if (body.gender === null) {
      updateData.gender = null;
    } else if (body.gender === "Male" || body.gender === "Female") {
      updateData.gender = body.gender;
    } else {
      const err = new Error("gender는 Male 또는 Female만 허용됩니다.");
      err.status = 400;
      throw err;
    }
  }

  // 5) 가입 완료 여부 (is_completed)
  if (body.is_completed !== undefined) {
    if (typeof body.is_completed === "boolean") {
      updateData.is_completed = body.is_completed;
    } else if (body.is_completed === "true" || body.is_completed === "false") {
      updateData.is_completed = body.is_completed === "true";
    } else {
      const err = new Error("is_completed 값이 올바르지 않습니다.");
      err.status = 400;
      throw err;
    }
  }

  return updateData;
}
