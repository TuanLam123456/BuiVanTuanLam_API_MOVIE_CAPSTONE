import { responseSuccess } from "../common/helpers/response.helper.js";
import { nguoiDungService } from "../services/nguoiDung.service.js";

export const nguoiDungController = {
  // Đăng ký Controller
  async dangKy(req,res,next) {
    const result = await nguoiDungService.dangKy(req)
    const response = responseSuccess(result,'Đăng ký thành công')
    res.status(response.statusCode).json(response)
  }
};
