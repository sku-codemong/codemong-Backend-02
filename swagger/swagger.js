// swagger/swagger.js
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// swagger-jsdoc v6 기준: 'definition' 키 사용
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "codemong 백엔드",
      description: "학습 시간 관리 서비스입니다.",
    },
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    servers: [
      {
        url: "https://codemong-backend02.onrender.com", // ✅ Render 주소만 사용
        description: "Render production server",
      },
    ],
    security: [{ BearerAuth: [] }],
  },
  // 주석이 들어있는 라우터/컨트롤러 경로로 맞춰주세요
  // 전체 src 폴더를 긁어오는게 안전합니다.
  apis: [path.join(__dirname, "..", "src", "**", "*.js")],
};

export const specs = swaggerJSDoc(options);
export { swaggerUi };
