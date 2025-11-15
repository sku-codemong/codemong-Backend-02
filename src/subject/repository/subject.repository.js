// src/subject/repository/subject.repository.js
import { prisma } from "../../db.config.js";

/**
 * **[Subject]**
 * **<🗄️ Repository>**
 * ***create***
 * subjects 테이블에 새로운 레코드를 insert 합니다.
 */
export async function create(userId, data) {
  return prisma.subjects.create({
    data: {
      user_id: userId,
      name: data.name,
      color: data.color ?? null,
      target_daily_min: data.target_daily_min ?? 0,
      credit: data.credit ?? null, // ⬅️ 새 필드
      difficulty: data.difficulty ?? "Normal", // ⬅️ 새 필드(enum)
      // weight는 서비스에서 계산해서 update하도록 두거나, DB default(1.00) 사용
    },
  });
}

/**
 * **[Subject]**
 * **<🗄️ Repository>**
 * ***updateById***
 * 과목 ID 기준으로 레코드를 업데이트합니다. (소유권 검증 포함 안전 버전)
 * - Prisma의 update는 PK만 허용하므로 updateMany로 소유권까지 한번에 체크
 * - 갱신 후 단건을 다시 읽어 반환
 */
export async function updateById(userId, id, data) {
  const { count } = await prisma.subjects.updateMany({
    where: { id, user_id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.target_daily_min !== undefined && {
        target_daily_min: data.target_daily_min,
      }),
      ...(data.credit !== undefined && { credit: data.credit }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
      ...(data.weight !== undefined && { weight: data.weight }), // 서비스에서 재계산한 값이 올 수 있음
    },
  });

  if (count === 0) return null; // 서비스에서 404 처리

  return prisma.subjects.findFirst({ where: { id, user_id: userId } });
}

/**
 * **[Subject]**
 * **<🗄️ Repository>**
 * ***findById***
 * 유저 소유 조건으로 과목 단건을 조회합니다.
 */
export async function findById(userId, id) {
  return prisma.subjects.findFirst({
    where: { id, user_id: userId },
  });
}

/**
 * **[Subject]**
 * **<🗄️ Repository>**
 * ***setArchived***
 * 과목의 archived 플래그를 변경합니다. (소유권 검증 포함)
 */
export async function setArchived(userId, id, archived) {
  const { count } = await prisma.subjects.updateMany({
    where: { id, user_id: userId },
    data: { archived },
  });

  if (count === 0) return null;

  return prisma.subjects.findFirst({ where: { id, user_id: userId } });
}

/**
 * **[Subject]**
 * **<🗄️ Repository>**
 * ***list***
 * 검색/보관여부/커서/limit 조건으로 과목 목록을 조회합니다.
 * 기본은 archived=false만, includeArchived=true면 모두 포함.
 */
export async function list(userId, { q, includeArchived, limit = 20, cursor }) {
  const where = {
    user_id: userId,
    ...(includeArchived ? {} : { archived: false }),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(cursor ? { id: { gt: Number(cursor) } } : {}),
  };

  const items = await prisma.subjects.findMany({
    where,
    take: limit,
    orderBy: { id: "asc" },
  });

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
}
