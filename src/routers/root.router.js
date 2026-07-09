import express from 'express'
import movieRouter from './movie.router.js';


const rootRouter = express.Router();

rootRouter.use('/movie',movieRouter)

export default rootRouter;