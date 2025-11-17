// src/user/controller/user.controller.js
import {
  getMyProfileService,
  updateMyProfileService,
  updateMyProfileImageService,
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

/**
 * ⭐ 프로필 이미지 업로드/변경
 * - multer-s3가 넣어주는 req.file.location(S3 URL)을 DB에 저장
 */
export async function updateMyProfileImage(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, message: "인증 정보가 없습니다." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ ok: false, message: "profile_image 파일이 필요합니다." });
    }

    const imageUrl = req.file.location; // ← S3에 올려진 파일의 전체 URL

    const updated = await updateMyProfileImageService(userId, imageUrl);
    const userDto = toUserProfileDto(updated);

    return res.status(200).json({
      ok: true,
      user: userDto,
    });
  } catch (err) {
    next(err);
  }
}
