import { UnauthorizedError } from "../helpers/exception.helper.js";
import { verifyAccessToken } from "../helpers/jwt.helper.js";
import { prisma } from "../prisma/connect.prisma.js";

export const authCookie = async (req, res, next) => {
  try {
    // Lấy access token từ cookie
    const accessToken = req.cookies?.accessToken;

    // Nếu không có access token
    if (!accessToken) {
      throw new UnauthorizedError("Không có token");
    }

    let decode;

    try {
      // Kiểm tra token có hợp lệ và còn hạn hay không
      decode = verifyAccessToken(accessToken);
    } catch (error) {
      // Token sai hoặc đã hết hạn
      throw new UnauthorizedError("Token không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra payload token có tai_khoan hay không
    if (!decode?.tai_khoan) {
      throw new UnauthorizedError("Token không hợp lệ");
    }

    // Tìm người dùng trong database
    const nguoiDungExists = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: decode.tai_khoan,
      },

      // Không lấy mật khẩu
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
      },
    });

    // Nếu tài khoản trong token không còn tồn tại
    if (!nguoiDungExists) {
      throw new UnauthorizedError("Người dùng không tồn tại");
    }

    // Gắn thông tin người dùng vào request
    // Các controller phía sau có thể dùng req.nguoiDung
    req.nguoiDung = nguoiDungExists;

    next();
  } catch (error) {
    next(error);
  }
};