import express from "express";
import { phimController } from "./../controllers/phim.controller.js";
import { authCookie } from "../common/middleware/authCookie.middleware.js";

const phimRouter = express.Router();

// Tạo route CRUD
phimRouter.post("/", phimController.create);
phimRouter.get("/", authCookie, phimController.findAll);
phimRouter.get("/:id", phimController.findOne);
phimRouter.patch("/:id", phimController.update);
phimRouter.delete("/:id", phimController.remove);

export default phimRouter;
