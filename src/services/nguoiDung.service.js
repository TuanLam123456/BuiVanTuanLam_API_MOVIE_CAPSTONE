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
import { buildQueryPrismaHelper } from "./../common/helpers/build-query-prisma.helper.js";
export const nguoiDungService = {
  // đăng ký Service
  async dangKy(req) {
    const { tai_khoan, mat_khau, email, so_dt, ma_nhom, ho_ten } = req.body;

    if (
      !tai_khoan?.trim() ||
      !mat_khau?.trim() ||
      !email?.trim() ||
      !ho_ten?.trim()
    ) {
      throw new BadRequestError("Các trường bắt buộc không được để trống");
    }

    // kiểm tra tài khoản đã tồn tại chưa, nếu đã tồn tại thì trả về lỗi, nếu chưa tồn tại thì tạo mới user
    const taiKhoanExisting = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: tai_khoan,
      },
    });
    if (taiKhoanExisting) {
      throw new BadRequestError(`Tài khoản ${tai_khoan} đã tồn tại`);
    }

    // kiểm tra email đã tồn tại chưa, nếu đã tồn tại thì trả về lỗi, nếu chưa tồn tại thì tạo mới user
    const emailExisting = await prisma.nguoiDung.findUnique({
      where: {
        email: email,
      },
    });
    if (emailExisting) {
      throw new BadRequestError(`Email ${email} đã tồn tại`);
    }

    // encrypt: MÃ HÓA
    // có thể dịch ngược để lấy dữ liệu
    const hashPassword = bcrypt.hashSync(mat_khau, 10);

    const nguoiDungMoi = await prisma.nguoiDung.create({
      data: {
        tai_khoan: tai_khoan,
        mat_khau: hashPassword,
        email: email,
        so_dt: so_dt,
        ma_nhom: ma_nhom,
        ho_ten: ho_ten,
      },
    });

    return nguoiDungMoi;
  },
  // đăng nhập Service
  async dangNhap(req) {
    const { tai_khoan, mat_khau } = req.body;

    // Kiểm tra tài khoản có tồn tại hay không
    // Nếu chưa tồn tại thì trả về lỗi, kêu người dùng đăng ký
    // Nếu đã tồn tại thì so sánh password
    const existingTaiKhoan = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: tai_khoan,
      },
      omit: {
        mat_khau: false,
      },
    });

    const isMatKhauValid = bcrypt.compareSync(
      mat_khau,
      existingTaiKhoan.mat_khau,
    );

    if (!existingTaiKhoan && !isMatKhauValid) {
      throw new BadRequestError(
        `Thông tin người dùng không đúng, vui lòng thử lại`,
      );
    }

    // Tạo access token
    // B1: tạo payload chứa thông tin: tai_khoan, email
    const nguoiDung = {
      tai_khoan: existingTaiKhoan.tai_khoan,
      email: existingTaiKhoan.email,
      so_dt: existingTaiKhoan.so_dt,
      ma_nhom: existingTaiKhoan.ma_nhom,
      ho_ten: existingTaiKhoan.ho_ten,
    };
    // B2: tạo access token từ payload
    const accessToken = signAccessToken(nguoiDung);

    // tạo refresh token từ payload
    const refreshToken = signRefreshToken(nguoiDung);

    return {
      accessToken,
      refreshToken,
      nguoiDung
    }
  },
};
