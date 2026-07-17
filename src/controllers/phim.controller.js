import { responseSuccess } from "../common/helpers/response.helper.js";
import { phimService } from "./../services/phim.service.js";

export const phimController = {
  // Lấy danh sách phim Controller
  async layDanhSachBanner(req, res, next) {
    const result = await phimService.layDanhSachBanner(req);
    const response = responseSuccess(result, `Lấy danh sách banner thành công`);
    res.status(response.statusCode).json(response);
  },
};
