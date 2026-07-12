import express from 'express';
import { phimController } from '../controllers/phim.controller.js';

const phimRouter = express.Router();

phimRouter.get('/',phimController.findAll)

export default phimRouter;
