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
  // Đăng ký Controller
  async dangKy(req, res, next) {
    const result = await nguoiDungService.dangKy(req);
    const response = responseSuccess(result, "Đăng ký thành công");
    res.status(response.statusCode).json(response);
  },
  // Đăng nhập Controller
  async dangNhap(req, res, next) {
    const { accessToken, refreshToken, nguoiDung } =
      await nguoiDungService.dangNhap(req);
    // lưu token vào cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS);
    const response = responseSuccess(
      {
        accessToken,
        nguoiDung,
      },
      "Đăng nhập thành công",
    );
    res.status(response.statusCode).json(response);
  },
  // Lấy danh sách người dùng Controller
  async layDanhSachNguoiDung(req, res, next) {
    const result = await nguoiDungService.layDanhSachNguoiDung(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách người dùng thành công",
    );

    res.status(response.statusCode).json(response);
  },
};
