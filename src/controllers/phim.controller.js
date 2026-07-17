import { responseSuccess } from "../common/helpers/response.helper.js";
import { phimService } from "./../services/phim.service.js";

export const phimController = {
  // Lấy danh sách Banner Controller
  async layDanhSachBanner(req, res, next) {
    const result = await phimService.layDanhSachBanner(req);
    const response = responseSuccess(result, `Lấy danh sách banner thành công`);
    res.status(response.statusCode).json(response);
  },

  // Lấy danh sách phim Controller
  async layDanhSachPhim(req, res, next) {
    try {
      const result = await phimService.layDanhSachPhim(req);

      const response = responseSuccess(result, "Lấy danh sách phim thành công");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Lấy danh sách phim phân trang Controller
  async layDanhSachPhimPhanTrang(req, res, next) {
    const result = await phimService.layDanhSachPhimPhanTrang(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách phim phân trang thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy danh sách phim phân trang theo ngày Controller
  async layDanhSachPhimTheoNgay(req, res, next) {
    const result = await phimService.layDanhSachPhimTheoNgay(req);

    const response = responseSuccess(
      result,
      "Lấy danh sách phim theo ngày thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Thêm phim Upload Hình Controller
  async themPhimUploadHinh(req, res, next) {
    const result = await phimService.themPhimUploadHinh(req);

    const response = responseSuccess(
      result,
      "Thêm phim upload hình thành công",
    );

    res.status(response.statusCode).json(response);
  },

  // Lấy thông tin phim Controller
  async layThongTinPhim(req, res, next) {
    try {
      const result = await phimService.layThongTinPhim(req);

      const response = responseSuccess(result, "Lấy thông tin phim thành công");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật phim Upload Hình Controller
  async capNhatPhimUpload(req, res, next) {
    try {
      const result = await phimService.capNhatPhimUpload(req);

      const response = responseSuccess(
        result,
        "Cập nhật phim upload hình thành công",
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  // Xóa phim Controller
  async xoaPhim(req, res, next) {
    try {
      const result = await phimService.xoaPhim(req);

      const response = responseSuccess(result, "Xóa phim thành công");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
