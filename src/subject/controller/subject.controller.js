import * as svc from "../service/subject.service.js";
import {
  parseCreateDto,
  parseUpdateDto,
  parseArchiveDto,
  parseListQueryDto,
} from "../dto/subject.request.dto.js";
import {
  toSubjectRes,
  toSubjectListItem,
} from "../dto/subject.response.dto.js";

const getUserId = (req) => req.user?.id;
/**
 * **[Subject]**
 * **<🎯 Controller>**
 * ***createSubject***
 * 과목을 생성합니다. DTO 파싱에 성공하면 서비스 계층을 호출하고,
 * 생성된 레코드를 응답 바디에 담아 201로 반환합니다.
 */
export async function createSubject(req, res, next) {
  try {
    console.log("[SUBJECT] controller user=", req.user);
    const userId = getUserId(req);
    const dto = parseCreateDto(req.body);
    const subject = await svc.createSubject(userId, dto);
    res.status(201).json({ ok: true, subject: toSubjectRes(subject) });
  } catch (e) {
    next(e);
  }
}

/**
 * **[Subject]**
 * **<🎯 Controller>**
 * ***updateSubject***
 * 과목 정보를 수정합니다. 소유권/존재 여부는 서비스에서 검증됩니다.
 * 성공 시 수정된 레코드를 200으로 반환합니다.
 */
export async function updateSubject(req, res, next) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const dto = parseUpdateDto(req.body);
    const subject = await svc.updateSubject(userId, id, dto);
    res.json({ ok: true, subject: toSubjectRes(subject) });
  } catch (e) {
    next(e);
  }
}

/**
 * **[Subject]**
 * **<🎯 Controller>**
 * ***archiveSubject***
 * 과목의 보관(archived=true)/복구(archived=false) 상태를 변경합니다.
 * 성공 시 변경된 레코드를 200으로 반환합니다.
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>Promise<void>}
 */
export async function archiveSubject(req, res, next) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const dto = parseArchiveDto(req.body); // { archived: boolean }
    const subject = await svc.setArchived(userId, id, dto.archived);
    res.json({ ok: true, subject: toSubjectRes(subject) });
  } catch (e) {
    next(e);
  }
}

/**
 * **[Subject]**
 * **<🎯 Controller>**
 * ***getSubjectById***
 * 과목 단건을 조회합니다. 소유권/존재 여부는 서비스에서 검증됩니다.
 *  */
export async function getSubjectById(req, res, next) {
  try {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const subject = await svc.getSubject(userId, id);
    res.json({ ok: true, subject: toSubjectRes(subject) });
  } catch (e) {
    next(e);
  }
}

/**
 * **[Subject]**
 * **<🎯 Controller>**
 * ***listSubjects***
 * 과목 목록을 페이징/검색(q, includeArchived) 조건으로 조회합니다.
 * nextCursor 기반 커서 페이지네이션을 제공합니다.
 */
export async function listSubjects(req, res, next) {
  try {
    const userId = getUserId(req);
    const q = parseListQueryDto(req.query);
    const { items, nextCursor } = await svc.listSubjects(userId, q);
    res.json({
      ok: true,
      items: items.map(toSubjectListItem),
      nextCursor,
    });
  } catch (e) {
    next(e);
  }
}
