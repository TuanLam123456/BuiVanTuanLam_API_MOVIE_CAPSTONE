import express from 'express';
import { movieController } from '../controllers/movie.controller.js';

const movieRouter = express.Router();

movieRouter.get('/',movieController.findAll)

export default movieRouter;
