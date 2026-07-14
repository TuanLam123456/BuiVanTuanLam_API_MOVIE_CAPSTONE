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
  // Đăng ký controller
  async register(req, res, next) {
    const result = await nguoiDungService.register(req);
    const response = responseSuccess(result, `Đăng ký người dùng thành công`);
    res.status(response.statusCode).json(response);
  },

  // Đăng nhập controller
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

  // Lấy danh sách người dùng controller
  async getUsers(req, res, next) {
    const result = await nguoiDungService.getUsers(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách người dùng thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy danh sách người dùng phân trang controller
  async getUsersPagination(req, res, next) {
    const result = await nguoiDungService.getUsersPagination(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách người dùng phân trang thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Tìm kiếm người dùng bằng từ khóa controller
  async searchUsers(req, res, next) {
    const result = await nguoiDungService.searchUsers(req);

    const response = responseSuccess(result, "Tìm kiếm người dùng thành công");

    res.status(response.statusCode).json(response);
  },

  // Tìm kiếm phân trang người dùng bằng từ khóa controller
  async searchUsersPagination(req, res, next) {
    const result = await nguoiDungService.searchUsersPagination(req);

    const response = responseSuccess(
      result,
      "Tìm kiếm người dùng phân trang thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy thông tin tài khoản từ Cookie controller
  async getProfile(req, res, next) {
    const result = await nguoiDungService.getProfile(req);

    const response = responseSuccess(
      result,
      "Lấy thông tin tài khoản thành công",
    );

    res.status(response.statusCode).json(response);
  },
};
