// src/upload/profile-image.s3.middleware.js
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { s3 } from "../aws/s3.client.js";

// .env에 넣어둔 버킷 이름
const bucket = process.env.AWS_S3_BUCKET_NAME;

// 이미지 파일만 허용
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("이미지 파일만 업로드할 수 있습니다."), false);
  }
  cb(null, true);
}

export const uploadProfileImage = multer({
  storage: multerS3({
    s3,
    bucket,
    // 버킷 정책으로 퍼블릭 읽기 열어놨으니까 별도 ACL 설정은 안 함
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      const ext = path.extname(file.originalname); // .jpg 같은 확장자
      const base = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const userId = req.user?.id ?? "anon";

      // S3 객체 key: profile/{userId}/{랜덤}.{ext}
      cb(null, `profile/${userId}/${base}${ext}`);
    },
  }),
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});
