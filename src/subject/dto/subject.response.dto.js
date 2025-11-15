// src/subject/dto/subject.response.dto.js
const toNum = (v) => (v == null ? null : Number(v));

// 1~5 외 값/NULL 방어: 기본 3
const toDifficulty = (v) => {
  if (v == null) return 3;
  const n = Number(v);
  if (!Number.isFinite(n)) return 3;
  // 혹시 모를 이상치 방어
  return Math.min(5, Math.max(1, Math.round(n)));
};

export function toSubjectRes(s) {
  return {
    id: s.id,
    name: s.name,
    color: s.color,
    target_daily_min: s.target_daily_min,

    credit: toNum(s.credit), // Decimal? -> number|null
    difficulty: toDifficulty(s.difficulty), // Int(1~5)

    weight: toNum(s.weight), // Decimal -> number
    archived: s.archived,

    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

export function toSubjectListItem(s) {
  return {
    id: s.id,
    name: s.name,
    color: s.color,
    credit: toNum(s.credit),
    difficulty: toDifficulty(s.difficulty),
    weight: toNum(s.weight),
    archived: s.archived,
    target_daily_min: s.target_daily_min,
    updated_at: s.updated_at,
  };
}
