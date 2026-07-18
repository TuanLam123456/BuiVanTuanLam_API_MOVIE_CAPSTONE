import { ForbiddenError } from "./../helpers/exception.helper.js";
export const authAdmin = (req, res, next) => {
  try {
    // req.nguoiDung đã được authCookie gắn vào request
    const nguoiDung = req.nguoiDung;
    if (!nguoiDung) {
      throw new ForbiddenError("Không tìm thấy thông tin người dùng");
    }
    // Kiểm tra quyền quản trị
    if (nguoiDung.loai_nguoi_dung !== "QUAN_TRI") {
      throw new ForbiddenError("Bạn không có quyền thực hiện chức năng này");
    }
    next();
  } catch (error) {
    next(error);
  }
};
