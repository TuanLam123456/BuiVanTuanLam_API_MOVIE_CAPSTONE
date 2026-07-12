import express from 'express'
import phimRouter from './phim.router.js';


const rootRouter = express.Router();

rootRouter.use('/phim',phimRouter)

export default rootRouter;