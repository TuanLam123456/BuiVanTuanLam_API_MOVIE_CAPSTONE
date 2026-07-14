import express from "express";
import { nguoiDungController } from "../controllers/nguoiDung.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const nguoiDungRouter = express.Router();



export default nguoiDungRouter;
