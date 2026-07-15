import express from "express";
import { nguoiDungController } from "../controllers/nguoiDung.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";
import { authAdmin } from "../common/middleware/authAdmin.middleware.js";

const nguoiDungRouter = express.Router();

// Đăng ký Router
nguoiDungRouter.post("/dangKy", nguoiDungController.dangKy);

// Đăng nhập Router
nguoiDungRouter.post("/dangNhap", nguoiDungController.dangNhap);

// Lấy danh sách người dùng Router
nguoiDungRouter.get(
  "/layDanhSachNguoiDung",
  authCookie,
  authAdmin,
  nguoiDungController.layDanhSachNguoiDung,
);

// Lấy danh sách người dùng phân trang Router
nguoiDungRouter.get(
  "/layDanhSachNguoiDungPhanTrang",
  authCookie,
  authAdmin,
  nguoiDungController.layDanhSachNguoiDungPhanTrang,
);


export default nguoiDungRouter;
