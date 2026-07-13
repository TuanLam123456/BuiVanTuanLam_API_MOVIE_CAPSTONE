import express from 'express';
import { nguoiDungController } from '../controllers/nguoiDung.controller.js';

const nguoiDungRouter = express.Router();

// Tạo route CRUD
nguoiDungRouter.post('/dangKy', nguoiDungController.register);
nguoiDungRouter.post('/dangNhap', nguoiDungController.login);


export default nguoiDungRouter;