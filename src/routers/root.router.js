import express from 'express'
import phimRouter from './phim.router.js';
import nguoiDungRouter from './nguoiDung.router.js';
import rapRouter from './rap.router.js';
import datVeRouter from "./datVe.router.js";

const rootRouter = express.Router();

rootRouter.use('/phim',phimRouter)
// Quản lý người dùng
rootRouter.use('/nguoiDung',nguoiDungRouter)
// Quản lý Rạp
rootRouter.use('/rap',rapRouter)
// Quản lý Đặt vé
rootRouter.use("/QuanLyDatVe", datVeRouter);

export default rootRouter;