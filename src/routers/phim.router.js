import express from "express";
import { phimController } from "./../controllers/phim.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

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

export default phimRouter;
