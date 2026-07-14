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
  // Đăng ký Service
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

  // Đăng nhập Service
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

  // Lấy danh sách người dùng Service
  async getUsers(req) {
    const danhSachNguoiDung = await prisma.nguoiDung.findMany({
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
      },
      orderBy: {
        tai_khoan: "desc",
      },
    });
    return danhSachNguoiDung;
  },

  // Lấy danh sách người dùng có phân trang service
  async getUsersPagination(req) {
    const { page, pageSize, index, filters } = buildQueryPrismaHelper(req);

    const [danhSachNguoiDung, totalItem] = await prisma.$transaction([
      prisma.nguoiDung.findMany({
        where: filters,
        skip: index,
        take: pageSize,
        select: {
          tai_khoan: true,
          ho_ten: true,
          email: true,
          so_dt: true,
          loai_nguoi_dung: true,
        },
        orderBy: {
          tai_khoan: "desc",
        },
      }),

      prisma.nguoiDung.count({
        where: filters,
      }),
    ]);

    const totalPage = Math.ceil(totalItem / pageSize);

    return {
      page,
      pageSize,
      totalItem,
      totalPage,
      items: danhSachNguoiDung,
    };
  },

  // Tìm kiếm người dùng bằng từ khóa service
  async searchUsers(req) {
    // Lấy keyword từ query params
    let { keyword } = req.query;

    // Kiểm tra từ khóa tìm kiếm
    if (!keyword || !keyword.trim()) {
      throw new BadRequestError("Vui lòng nhập từ khóa tìm kiếm");
    }

    // Xóa khoảng trắng ở đầu và cuối
    keyword = keyword.trim();

    // Chuyển từ khóa sang số để tìm theo tài khoản
    const taiKhoan = Number(keyword);

    // Các điều kiện tìm kiếm
    const searchConditions = [
      {
        ho_ten: {
          contains: keyword,
        },
      },
      {
        email: {
          contains: keyword,
        },
      },
      {
        so_dt: {
          contains: keyword,
        },
      },
    ];

    // Nếu keyword là số thì tìm thêm theo tài khoản
    if (!Number.isNaN(taiKhoan)) {
      searchConditions.push({
        tai_khoan: taiKhoan,
      });
    }

    const danhSachNguoiDung = await prisma.nguoiDung.findMany({
      where: {
        OR: searchConditions,
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
      },
      orderBy: {
        tai_khoan: "desc",
      },
    });

    return danhSachNguoiDung;
  },

  // Tìm kiếm phân trang người dùng bằng từ khóa service
  async searchUsersPagination(req) {
    let { keyword } = req.query;

    if (!keyword || !keyword.trim()) {
      throw new BadRequestError("Vui lòng nhập từ khóa tìm kiếm");
    }

    keyword = keyword.trim();

    // Dùng helper để xử lý page, pageSize và index
    const { page, pageSize, index } = buildQueryPrismaHelper(req);

    // Chuyển keyword sang số để tìm theo tài khoản
    const taiKhoan = Number(keyword);

    // Điều kiện tìm kiếm chung
    const searchConditions = [
      {
        ho_ten: {
          contains: keyword,
        },
      },
      {
        email: {
          contains: keyword,
        },
      },
      {
        so_dt: {
          contains: keyword,
        },
      },
    ];

    // Nếu keyword là số thì tìm thêm theo tài khoản
    if (!Number.isNaN(taiKhoan)) {
      searchConditions.push({
        tai_khoan: taiKhoan,
      });
    }

    const whereCondition = {
      OR: searchConditions,
    };

    const [danhSachNguoiDung, totalItem] = await prisma.$transaction([
      prisma.nguoiDung.findMany({
        where: whereCondition,
        skip: index,
        take: pageSize,
        select: {
          tai_khoan: true,
          ho_ten: true,
          email: true,
          so_dt: true,
          loai_nguoi_dung: true,
        },
        orderBy: {
          tai_khoan: "desc",
        },
      }),

      prisma.nguoiDung.count({
        where: whereCondition,
      }),
    ]);

    const totalPage = Math.ceil(totalItem / pageSize);

    return {
      keyword,
      page,
      pageSize,
      totalItem,
      totalPage,
      items: danhSachNguoiDung,
    };
  },

  // Lấy thông tin tài khoản từ Cookie service
  async getProfile(req) {
    const { tai_khoan } = req.user;

    const nguoiDung = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan,
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
      },
    });

    return nguoiDung;
  },

  // Lấy thông tin tài khoản từ Cookie service
  async getProfile(req) {
    return req.nguoiDung;
  },
};
