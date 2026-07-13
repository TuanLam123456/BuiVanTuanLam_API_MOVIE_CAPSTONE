import express from 'express'
import phimRouter from './phim.router.js';
import nguoiDungRouter from './nguoiDung.router.js';


const rootRouter = express.Router();

rootRouter.use('/phim',phimRouter)
rootRouter.use('/nguoiDung',nguoiDungRouter)

export default rootRouter;