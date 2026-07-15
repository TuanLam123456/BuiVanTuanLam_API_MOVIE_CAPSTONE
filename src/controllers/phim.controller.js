import { responseSuccess } from "../common/helpers/response.helper.js";
import { phimService } from "./../services/phim.service.js";

export const phimController = {
  // Lấy danh sách phim Controller
  async danhSachPhim(req, res, next) {
    const result = await phimService.findAll(req);
    const response = responseSuccess(result, `Lấy danh sách phim thành công`);
    res.status(response.statusCode).json(response);
  },
};
