function ensureString(v, name) {
  if (typeof v !== "string" || v.trim() === "")
    throw new Error(`${name} is required`);
  return v.trim();
}
function toIntOrNull(v, name) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0)
    throw new Error(`${name} must be a non-negative integer`);
  return n;
}
function toNumberOrNull(v, name) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`${name} must be a number`);
  return n;
}

export function parseCreateDto(body) {
  return {
    name: ensureString(body.name, "name"),
    color: body.color?.trim() || null,
    target_daily_min:
      toIntOrNull(body.target_daily_min, "target_daily_min") ?? 0,
    credit: body.credit != null ? Number(body.credit) : null,
    difficulty: body.difficulty ?? "Normal",
  };
}

export function parseUpdateDto(body) {
  const dto = {};
  if (body.name !== undefined) dto.name = ensureString(body.name, "name");
  if (body.color !== undefined) dto.color = body.color?.trim() || null;
  if (body.target_daily_min !== undefined)
    dto.target_daily_min = toIntOrNull(
      body.target_daily_min,
      "target_daily_min"
    );
  if (body.credit !== undefined)
    dto.credit = body.credit != null ? Number(body.credit) : null;
  if (body.difficulty !== undefined) dto.difficulty = body.difficulty;
  if (body.archived !== undefined) dto.archived = !!body.archived;
  return dto;
}

export function parseArchiveDto(body) {
  if (typeof body.archived !== "boolean")
    throw new Error("archived must be boolean");
  return { archived: body.archived };
}

export function parseListQueryDto(qs) {
  return {
    q: typeof qs.q === "string" ? qs.q.trim() : "",
    includeArchived: qs.includeArchived === "true",
    limit: Math.min(50, toIntOrNull(qs.limit, "limit") ?? 20),
    cursor: qs.cursor ? Number(qs.cursor) : null, // id 기반 커서
  };
}
