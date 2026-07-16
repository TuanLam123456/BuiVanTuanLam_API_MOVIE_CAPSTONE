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

  // Lấy danh sách người dùng phân trang Controller
  async layDanhSachNguoiDungPhanTrang(req, res, next) {
    const result = await nguoiDungService.layDanhSachNguoiDungPhanTrang(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách người dùng phân trang thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy thông tin tài khoản đăng nhập Controller
  async thongTinTaiKhoan(req, res, next) {
    const result = await nguoiDungService.thongTinTaiKhoan(req);

    const response = responseSuccess(
      result,
      "Lấy thông tin tài khoản thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy danh sách loại người dùng Controller
  async layDanhSachLoaiNguoiDung(req, res, next) {
    const result = await nguoiDungService.layDanhSachLoaiNguoiDung(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách loại người dùng thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Tìm kiếm người dùng Controller
  async timKiemNguoiDung(req, res, next) {
    const result = await nguoiDungService.timKiemNguoiDung(req);

    const response = responseSuccess(result, "Tìm kiếm người dùng thành công");

    res.status(response.statusCode).json(response);
  },

  // Tìm kiếm người dùng phân trang Controller
  async timKiemNguoiDungPhanTrang(req, res, next) {
    const result = await nguoiDungService.timKiemNguoiDungPhanTrang(req);

    const response = responseSuccess(
      result,
      "Tìm kiếm người dùng phân trang thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Thêm người dùng Controller
  async themNguoiDung(req, res, next) {
    const result = await nguoiDungService.themNguoiDung(req);

    const response = responseSuccess(result, "Thêm người dùng thành công");

    res.status(response.statusCode).json(response);
  },

  // Cập nhật thông tin người dùng Controller
  async capNhatThongTinNguoiDung(req, res, next) {
    const result = await nguoiDungService.capNhatThongTinNguoiDung(req);

    const response = responseSuccess(
      result,
      "Cập nhật thông tin người dùng thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Xóa người dùng Controller
  async xoaNguoiDung(req, res, next) {
    const result = await nguoiDungService.xoaNguoiDung(req);

    const response = responseSuccess(result, "Xóa người dùng thành công");

    res.status(response.statusCode).json(response);
  },
};
