import { responseSuccess } from "../common/helpers/response.helper.js";
import { datVeService } from "../services/datVe.service.js";

export const datVeController = {
  // Đặt vé Controller
  async datVe(req, res, next) {
    const result = await datVeService.datVe(req);

    const response = responseSuccess(
      result,
      "Đặt vé thành công",
    );

    res.status(response.statusCode).json(response);
  },
};