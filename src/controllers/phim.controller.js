import { responseSuccess } from "../common/helpers/response.helper.js";
import { phimService } from './../services/phim.service.js';

export const phimController = {
   async create(req, res, next) {
      const result = await phimService.create(req);
      const response = responseSuccess(result, `Create phim successfully`);
      res.status(response.statusCode).json(response);
   },

   async findAll(req, res, next) {
      const result = await phimService.findAll(req);
      const response = responseSuccess(result, `Get all phims successfully`);
      res.status(response.statusCode).json(response);
   },

   async findOne(req, res, next) {
      const result = await phimService.findOne(req);
      const response = responseSuccess(result, `Get phim #${req.params.id} successfully`);
      res.status(response.statusCode).json(response);
   },

   async update(req, res, next) {
      const result = await phimService.update(req);
      const response = responseSuccess(result, `Update phim #${req.params.id} successfully`);
      res.status(response.statusCode).json(response);
   },

   async remove(req, res, next) {
      const result = await phimService.remove(req);
      const response = responseSuccess(result, `Remove phim #${req.params.id} successfully`);
      res.status(response.statusCode).json(response);
   }
};