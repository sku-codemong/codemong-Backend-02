// src/aws/s3.client.js
import { S3Client } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!REGION || !ACCESS_KEY || !SECRET_KEY) {
  console.warn(
    "[S3] 환경변수(AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)가 설정되지 않았습니다."
  );
}

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
