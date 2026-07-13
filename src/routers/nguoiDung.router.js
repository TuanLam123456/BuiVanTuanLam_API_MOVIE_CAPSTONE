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

export default nguoiDungRouter;
