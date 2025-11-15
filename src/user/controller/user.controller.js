// src/user/controller/user.controller.js
import {
  getMyProfileService,
  updateMyProfileService,
} from "../service/user.service.js";
import { toUserProfileDto } from "../dto/user.response.dto.js";
import { parseUpdateProfileRequest } from "../dto/user.request.dto.js";

export async function getMyProfile(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, message: "인증 정보가 없습니다." });
    }

    const user = await getMyProfileService(userId);
    const userDto = toUserProfileDto(user);

    return res.status(200).json({
      ok: true,
      user: userDto,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, message: "인증 정보가 없습니다." });
    }

    // body 파싱 + 이메일 변경 시도 차단
    const updateData = parseUpdateProfileRequest(req.body);

    const updated = await updateMyProfileService(userId, updateData);
    const userDto = toUserProfileDto(updated);

    return res.status(200).json({
      ok: true,
      user: userDto,
    });
  } catch (err) {
    next(err);
  }
}
