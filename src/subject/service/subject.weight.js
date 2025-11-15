// src/subject/service/subject.weight.js

// 난이도(1~5) 가중치 테이블: 원하면 계수만 바꿔도 됨
const DIFF_MUL = {
  1: 0.85, // 매우 쉬움
  2: 0.95, // 쉬움
  3: 1.0, // 보통
  4: 1.15, // 어려움
  5: 1.3, // 매우 어려움
};

function diffMulFromInt(val) {
  // null/undefined/이상치 방어: 기본 3(보통)
  const n = Number.isInteger(val) ? val : 3;
  const clamped = Math.min(5, Math.max(1, n));
  return DIFF_MUL[clamped];
}

export async function recalcSubjectWeight(prisma, userId, subjectId) {
  const s = await prisma.subjects.findFirst({
    where: { id: subjectId, user_id: userId },
    // ⬇️ archived를 반드시 포함
    select: { credit: true, difficulty: true, archived: true },
  });
  if (!s) throw new Error("SUBJECT_NOT_FOUND");
  if (s.archived) return null;

  const credit = Number(s.credit ?? 0);
  const diffMul = diffMulFromInt(s.difficulty); // ⬅️ 정수 난이도 → 계수

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  const [openEst, urgentCnt] = await Promise.all([
    prisma.subject_tasks.aggregate({
      _sum: { estimated_min: true },
      where: {
        user_id: userId,
        subject_id: subjectId,
        // TaskStatus: ["todo","in_progress","done"]로 축소됨 → 사용 중인 두 상태만 유지
        status: { in: ["todo", "in_progress"] },
      },
    }),
    prisma.subject_tasks.count({
      where: {
        user_id: userId,
        subject_id: subjectId,
        status: { in: ["todo", "in_progress"] },
        due_at: { gte: now, lte: soon },
      },
    }),
  ]);

  const totalEst = Number(openEst._sum.estimated_min ?? 0); // 분

  // ⬇️ 규칙(원한다면 계수만 조정)
  const creditMul = credit > 0 ? Math.min(1.4, 0.8 + credit / 3.5) : 1.0;
  const loadMul = 1 + Math.min(0.5, totalEst / 600); // 10시간(600분) 기준 최대 +0.5
  const urgentMul = 1 + Math.min(0.3, urgentCnt * 0.1);

  let w = 1.0 * diffMul * creditMul * loadMul * urgentMul;

  // 0.5 ~ 3.0 사이로 클램프하고 소수 둘째자리 반올림
  w = Math.max(0.5, Math.min(3.0, Math.round(w * 100) / 100));

  await prisma.subjects.update({
    where: { id: subjectId },
    data: { weight: w },
  });
  return w;
}
