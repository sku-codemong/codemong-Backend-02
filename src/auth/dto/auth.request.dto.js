import { isAllowedSchoolEmail } from "../../utils/domain.js";

function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isInt(v) {
  return Number.isInteger(v);
}
function isEnum(v, list) {
  return typeof v === "string" && list.includes(v);
}
function normalizeEmail(v) {
  return v.trim().toLowerCase();
}

function assert(cond, code, msg) {
  if (!cond) {
    const e = new Error(code);
    e.code = code;
    e.message = msg || code;
    throw e;
  }
}

/**
 * **[Auth]**
 * **<🧾 DTO>**
 * ***parseRegisterRequest***
 * '회원가입' 요청 파서입니다.
 * 필수: email, password
 * 선택: nickname(string), grade(int), gender("Male"|"Female")
 * @param {object} body
 * @returns {{email:string,password:string,nickname?:string,grade?:number,gender?:"Male"|"Female"}}
 */
export function parseRegisterRequest(body = {}) {
  const { email, password, nickname, grade, gender } = body;

  assert(isEmail(email), "BAD_EMAIL", "invalid email");
  assert(
    isNonEmptyString(password) && password.trim().length >= 6,
    "BAD_PASSWORD",
    "password must be ≥ 6 chars"
  );
  assert(
    isAllowedSchoolEmail(email),
    "NOT_SCHOOL_EMAIL",
    "email must be a school domain"
  );

  const dto = {
    email: normalizeEmail(email),
    password: password.trim(),
  };

  if (nickname !== undefined) {
    assert(
      typeof nickname === "string",
      "BAD_NICKNAME",
      "nickname must be string"
    );
    dto.nickname = nickname.trim();
  }

  if (grade !== undefined) {
    // 숫자 형태로 들어오는 경우를 허용 (예: "2")
    const g = typeof grade === "string" ? Number(grade) : grade;
    assert(isInt(g), "BAD_GRADE", "grade must be an integer");
    dto.grade = g;
  }

  if (gender !== undefined) {
    assert(
      isEnum(gender, ["Male", "Female"]),
      "BAD_GENDER",
      'gender must be "Male" or "Female"'
    );
    dto.gender = gender;
  }

  return dto;
}

/**
 * **[Auth]**
 * **<🧾 DTO>**
 * ***parseLoginRequest***
 * '로그인' 요청 파서입니다.
 * 필수: email, password
 * @param {object} body
 * @returns {{email:string,password:string}}
 */
export function parseLoginRequest(body = {}) {
  const { email, password } = body;

  assert(isEmail(email), "BAD_EMAIL", "invalid email");
  assert(isNonEmptyString(password), "BAD_PASSWORD", "password required");
  assert(
    isAllowedSchoolEmail(email),
    "NOT_SCHOOL_EMAIL",
    "email must be a school domain"
  );

  return {
    email: normalizeEmail(email),
    password: password.trim(),
  };
}

/**
 * **[Auth]**
 * **<🧾 DTO>**
 * ***parseLogoutRequest***
 * '로그아웃' 요청 파서입니다.
 * 선택: allDevices(boolean), userId(number)
 * allDevices=true 인 경우 userId가 숫자인지 검사합니다.
 * @param {object} body
 * @returns {{allDevices?:boolean,userId?:number}}
 */
export function parseLogoutRequest(body = {}) {
  const { allDevices, userId } = body;

  const dto = {};
  if (allDevices !== undefined) {
    assert(
      typeof allDevices === "boolean",
      "BAD_ALL_DEVICES",
      "allDevices must be boolean"
    );
    dto.allDevices = allDevices;
  }
  if (userId !== undefined) {
    const uid = typeof userId === "string" ? Number(userId) : userId;
    assert(isInt(uid), "BAD_USER_ID", "userId must be an integer");
    dto.userId = uid;
  }

  if (dto.allDevices === true) {
    assert(
      dto.userId !== undefined,
      "MISSING_USER_ID",
      "userId is required when allDevices=true"
    );
  }

  return dto;
}
