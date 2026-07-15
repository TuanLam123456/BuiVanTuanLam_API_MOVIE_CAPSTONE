import express from "express";
import { nguoiDungController } from "../controllers/nguoiDung.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";
import { authAdmin } from "../common/middleware/authAdmin.middleware.js";

const nguoiDungRouter = express.Router();

// Đăng ký Router
nguoiDungRouter.post("/dangKy", nguoiDungController.dangKy);

// Đăng nhập Router
nguoiDungRouter.post("/dangNhap", nguoiDungController.dangNhap);

// Lấy danh sách loại người dùng Router
nguoiDungRouter.get(
  "/layDanhSachLoaiNguoiDung",
  authCookie,
  authAdmin,
  nguoiDungController.layDanhSachLoaiNguoiDung,
);

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

// Lấy thông tin tài khoản đăng nhập Router
nguoiDungRouter.get(
  "/thongTinTaiKhoan",
  authCookie,
  nguoiDungController.thongTinTaiKhoan,
);

export default nguoiDungRouter;
