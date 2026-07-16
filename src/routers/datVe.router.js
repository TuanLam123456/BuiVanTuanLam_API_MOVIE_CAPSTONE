import express from "express";
import { datVeController } from "../controllers/datVe.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";
import { authAdmin } from "../common/middleware/authAdmin.middleware.js";

const datVeRouter = express.Router();

// Đặt vé Router
datVeRouter.post(
  "/datVe",
  authCookie,
  datVeController.datVe,
);

// Lấy danh sách phòng vé Router
datVeRouter.get(
  "/layDanhSachPhongVe",
  authCookie,
  datVeController.layDanhSachPhongVe,
);

// Tạo lịch chiếu Router - Admin
datVeRouter.post(
  "/taoLichChieu",
  authCookie,
  authAdmin,
  datVeController.taoLichChieu,
);

export default datVeRouter;