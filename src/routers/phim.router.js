import express from "express";
import { phimController } from "./../controllers/phim.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const phimRouter = express.Router();

// Lấy danh sách phim Router
phimRouter.get("/", phimController.danhSachPhim);

export default phimRouter;
