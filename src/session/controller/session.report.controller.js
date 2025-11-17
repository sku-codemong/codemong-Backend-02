import { prisma } from "../../db.config.js";
import * as service from "../service/session.report.service.js";
import {
  DailyReportRequestDTO,
  WeeklyReportRequestDTO,
  UpdateDailyTargetRequestDTO,
} from "../dto/session.request.dto.js";
import {
  DailyReportResponseDTO,
  WeeklyReportResponseDTO,
  TodayRecommendationResponseDTO,
  TotalStudyTimeResponseDTO,
} from "../dto/session.response.dto.js";

export const getDailyReport = async (req, res) => {
  const dto = new DailyReportRequestDTO(req.query);
  const data = await service.getDailyReport(req.user.id, dto);
  return res.json({ ok: true, report: new DailyReportResponseDTO(data) });
};

export const getWeeklyReport = async (req, res) => {
  const dto = new WeeklyReportRequestDTO(req.query);
  const data = await service.getWeeklyReport(req.user.id, dto);
  return res.json({ ok: true, report: new WeeklyReportResponseDTO(data) });
};

export const getTodayRecommendation = async (req, res) => {
  const data = await service.getTodayRecommendation(req.user.id);
  return res.json({
    ok: true,
    recommendation: new TodayRecommendationResponseDTO(data),
  });
};

export const updateDailyTarget = async (req, res) => {
  const dto = new UpdateDailyTargetRequestDTO(req.body);
  const daily_target_min = await service.updateDailyTarget(req.user.id, dto);

  return res.json({
    ok: true,
    daily_target_min,
  });
};

export const getTotalStudyTime = async (req, res) => {
  try {
    const requesterId = req.user.id; // 로그인한 유저
    const targetUserId = req.query.user_id
      ? Number(req.query.user_id)
      : requesterId; // 쿼리 없으면 자기 자신

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res
        .status(400)
        .json({ ok: false, message: "user_id가 올바르지 않습니다." });
    }

    // 🔐 자기 자신이면 바로 허용
    if (targetUserId !== requesterId) {
      // friends 테이블에서 서로 친구인지 확인
      const friendship = await prisma.friends.findFirst({
        where: {
          OR: [
            { user_id: requesterId, friend_user_id: targetUserId },
            { user_id: targetUserId, friend_user_id: requesterId },
          ],
        },
      });

      if (!friendship) {
        return res.status(403).json({
          ok: false,
          message: "해당 유저의 총 학습 시간은 친구에게만 공개됩니다.",
        });
      }
    }

    const data = await service.getTotalStudyTime(targetUserId);

    return res.json({
      ok: true,
      total: new TotalStudyTimeResponseDTO(data),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: "총 학습 시간 조회 중 오류가 발생했습니다.",
    });
  }
};
