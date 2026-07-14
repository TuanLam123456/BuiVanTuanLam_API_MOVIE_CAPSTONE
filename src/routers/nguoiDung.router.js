import express from "express";
import { nguoiDungController } from "../controllers/nguoiDung.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const nguoiDungRouter = express.Router();

// Đăng ký Router
nguoiDungRouter.post("/dangKy", nguoiDungController.register);
// Đăng nhập Router
nguoiDungRouter.post("/dangNhap", nguoiDungController.login);
// Lấy danh sách người dùng Router
nguoiDungRouter.get("/danhSach", authCookie, nguoiDungController.getUsers);
// Lấy danh sách người dùng phân trang Router
nguoiDungRouter.get(
  "/danhSachPhanTrang",
  authCookie,
  nguoiDungController.getUsersPagination,
);
// Tìm kiếm người dùng bằng từ khóa Router
nguoiDungRouter.get("/timKiem", authCookie, nguoiDungController.searchUsers);

export default nguoiDungRouter;
