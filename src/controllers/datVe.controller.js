import { responseSuccess } from "../common/helpers/response.helper.js";
import { datVeService } from "../services/datVe.service.js";

export const datVeController = {
  // Đặt vé Controller
  async datVe(req, res, next) {
    const result = await datVeService.datVe(req);

    const response = responseSuccess(result, "Đặt vé thành công");

    res.status(response.statusCode).json(response);
  },

  // Lấy danh sách phòng vé Controller
  async layDanhSachPhongVe(req, res, next) {
    const result = await datVeService.layDanhSachPhongVe(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách phòng vé thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Tạo lịch chiếu Controller
  async taoLichChieu(req, res, next) {
    const result = await datVeService.taoLichChieu(req);

    const response = responseSuccess(result, "Tạo lịch chiếu thành công");

    res.status(response.statusCode).json(response);
  },
};
