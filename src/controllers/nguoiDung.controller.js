import { responseSuccess } from "../common/helpers/response.helper.js";
import { nguoiDungService } from "../services/nguoiDung.service.js";

// cấu hình cookies để chặn JS truy cập vào cookie
const COOKIE_OPTIONS = {
  httpOnly: true, // chặn JS truy cập vào cookie
  sameSite: "lax", // chỉ gửi cookie trong cùng 1 trang web
  secure: false, // develop: false, production: true
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

export const nguoiDungController = {
  async register(req, res, next) {
    const result = await nguoiDungService.register(req);
    const response = responseSuccess(result, `Đăng ký người dùng thành công`);
    res.status(response.statusCode).json(response);
  },

  async login(req, res, next) {
    const { accessToken, refreshToken, nguoiDung } =
      await nguoiDungService.login(req);
    //  lưu refresh token vào cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS);

    const response = responseSuccess(
      { accessToken, nguoiDung },
      `Đăng nhập thành công`,
    );
    res.status(response.statusCode).json(response);
  },
};
