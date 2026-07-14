import express from "express";
import { nguoiDungController } from "../controllers/nguoiDung.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const nguoiDungRouter = express.Router();

// Đăng ký Router
nguoiDungRouter.post("/dangKy", nguoiDungController.dangKy);

// Đăng nhập Router
nguoiDungRouter.post("/dangNhap", nguoiDungController.dangNhap);

// Lấy danh sách người dùng Router
nguoiDungRouter.get(
  "/layDanhSachNguoiDung",
  authCookie,
  nguoiDungController.layDanhSachNguoiDung,
);

export default nguoiDungRouter;
