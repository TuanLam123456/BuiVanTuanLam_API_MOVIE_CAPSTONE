import express from "express";
import { datVeController } from "../controllers/datVe.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const datVeRouter = express.Router();

// Đặt vé Router
datVeRouter.post(
  "/datVe",
  authCookie,
  datVeController.datVe,
);

export default datVeRouter;