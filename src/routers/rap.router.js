import express from "express";
import { rapController } from './../controllers/rap.controller.js';

const rapRouter = express.Router()

// Lấy thông tin hệ thống rạp Router
rapRouter.get('/layThongTinHeThongRap',rapController.layThongTinHeThongRap)

export default rapRouter;