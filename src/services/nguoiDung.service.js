import bcrypt from "bcrypt";
import {
  BadRequestError,
  UnauthorizedError,
} from "./../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  signAccessToken,
  signRefreshToken,
} from "./../common/helpers/jwt.helper.js";
export const nguoiDungService = {
  // Đăng ký người dùng
  async register(req) {
    // Lấy dữ liệu từ body
    const { ho_ten, email, so_dt, mat_khau, loai_nguoi_dung } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!ho_ten || !email || !mat_khau) {
      throw new BadRequestError(
        "Họ tên, email và mật khẩu không được phép để trống",
      );
    }

    // Kiểm tra email đã tồn tại trong database hay chưa
    const nguoiDungExists = await prisma.nguoiDung.findUnique({
      where: {
        email,
      },
    });

    // Nếu email đã tồn tại thì không cho đăng ký
    if (nguoiDungExists) {
      throw new BadRequestError("Email đã tồn tại");
    }

    // Mã hóa mật khẩu trước khi lưu vào database
    // Số 10 là salt rounds
    const matKhauMaHoa = await bcrypt.hash(mat_khau, 10);

    // Tạo người dùng mới
    const nguoiDungMoi = await prisma.nguoiDung.create({
      data: {
        ho_ten,
        email,
        so_dt: so_dt || null,
        mat_khau: matKhauMaHoa,
        loai_nguoi_dung: loai_nguoi_dung || "Customer",
      },
      // Chỉ trả về các trường cần thiết
      // Không trả mật khẩu về cho client
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
      },
    });

    return nguoiDungMoi;
  },

  // Đăng nhập người dùng
  async login(req) {
    // Lấy email và mật khẩu từ body
    const { email, mat_khau } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !mat_khau) {
      throw new BadRequestError("Email và mật khẩu không được phép để trống");
    }

    // Tìm người dùng theo email
    const nguoiDungExists = await prisma.nguoiDung.findUnique({
      where: {
        email,
      },
    });

    // Không nên thông báo riêng là email không tồn tại
    // để tránh làm lộ email đã đăng ký trong hệ thống
    if (!nguoiDungExists) {
      throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }

    // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa
    const isPasswordCorrect = await bcrypt.compare(
      mat_khau,
      nguoiDungExists.mat_khau,
    );

    //  Nếu mật khẩu không đúng
    if (!isPasswordCorrect) {
      throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }

    // Payload chứa thông tin cần thiết của người dùng
    // Payload này sẽ được mã hóa vào access token
    const accessTokenPayload = {
      tai_khoan: nguoiDungExists.tai_khoan,
      email: nguoiDungExists.email,
      loai_nguoi_dung: nguoiDungExists.loai_nguoi_dung,
    };

    // Tạo access token có thời gian sống ngắn
    const accessToken = signAccessToken(accessTokenPayload);

    // Tạo refresh token
    // Refresh token chỉ cần chứa mã tài khoản
    const refreshToken = signRefreshToken({
      tai_khoan: nguoiDungExists.tai_khoan,
    });

    return {
      accessToken,
      refreshToken,
      nguoiDung: {
        tai_khoan: nguoiDungExists.tai_khoan,
        ho_ten: nguoiDungExists.ho_ten,
        email: nguoiDungExists.email,
        so_dt: nguoiDungExists.so_dt,
        loai_nguoi_dung: nguoiDungExists.loai_nguoi_dung,
      },
    };
  },
};
