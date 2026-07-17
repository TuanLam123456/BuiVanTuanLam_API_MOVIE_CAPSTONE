import express from "express";
import { phimController } from "./../controllers/phim.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";
import { authAdmin } from './../common/middleware/authAdmin.middleware.js';
import { uploadDiskStorage } from './../common/multer/disk-storage.multer.js';

const phimRouter = express.Router();

// Lấy danh sách banner Router
phimRouter.get("/layDanhSachBanner", phimController.layDanhSachBanner);

// Lấy danh sách phim Router
phimRouter.get("/layDanhSachPhim", phimController.layDanhSachPhim);

// Lấy danh sách phim phân trang Router
phimRouter.get(
  "/layDanhSachPhimPhanTrang",
  phimController.layDanhSachPhimPhanTrang,
);

// Lấy danh sách phim phân trang theo ngày Router
phimRouter.get(
  "/layDanhSachPhimTheoNgay",
  phimController.layDanhSachPhimTheoNgay,
);

// Thêm phim Upload Hình Router
phimRouter.post(
  "/ThemPhimUploadHinh",
  authCookie,
  authAdmin,
  uploadDiskStorage.single("hinhAnh"),
  phimController.themPhimUploadHinh,
);

export default phimRouter;
