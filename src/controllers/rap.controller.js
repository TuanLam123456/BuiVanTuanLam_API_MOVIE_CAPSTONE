import { responseSuccess } from "../common/helpers/response.helper.js";
import { rapService } from "../services/rap.service.js";

export const rapController = {
  // Lấy thông tin hệ thống rạp Controller
  async layThongTinHeThongRap(req, res, next) {
    const result = await rapService.layThongTinHeThongRap(req);

    const response = responseSuccess(
      result,
      "Lấy thông tin hệ thống rạp thành công",
    );

    res.status(response.statusCode).json(response);
  },
  // Lấy thông tin cụm rạp theo hệ thống Controller
  async layThongTinCumRapTheoHeThong(req, res, next) {
    const result = await rapService.layThongTinCumRapTheoHeThong(req);

    const response = responseSuccess(
      result,
      "Lấy thông tin cụm rạp theo hệ thống thành công",
    );

    res.status(response.statusCode).json(response);
  },
};
