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
        ma_nhom: ma_nhom || "GP01",
        ho_ten: ho_ten,
        loai_nguoi_dung: "KhachHang",
      },
    });

    return nguoiDungMoi;
  },

  // Đăng ký Service
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
      nguoiDung,
    };
  },

  // Lấy danh sách người dùng Service
  async layDanhSachNguoiDung(req) {
    const { ma_nhom, tu_khoa } = req.query;

    if (!ma_nhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    const keyword = tu_khoa?.trim();

    const danhSachNguoiDung = await prisma.nguoiDung.findMany({
      where: {
        ma_nhom: ma_nhom.trim(),
        ...(keyword && {
          OR: [
            {
              tai_khoan: {
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
            {
              ho_ten: {
                contains: keyword,
              },
            },
          ],
        }),
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
      orderBy: {
        tai_khoan: "asc",
      },
    });

    return danhSachNguoiDung;
  },

  // Lấy danh sách người dùng Service
  async layDanhSachNguoiDungPhanTrang(req) {
    const { ma_nhom, tu_khoa, page = "1", pageSize = "10" } = req.query;

    if (!ma_nhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    const currentPage = Number(page);
    const currentPageSize = Number(pageSize);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(currentPageSize) ||
      currentPageSize < 1
    ) {
      throw new BadRequestError("page và pageSize phải là số nguyên lớn hơn 0");
    }

    const keyword = tu_khoa?.trim();

    const whereCondition = {
      ma_nhom: ma_nhom.trim(),

      ...(keyword && {
        OR: [
          {
            tai_khoan: {
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
          {
            ho_ten: {
              contains: keyword,
            },
          },
        ],
      }),
    };

    const [danhSachNguoiDung, tongSoNguoiDung] = await prisma.$transaction([
      prisma.nguoiDung.findMany({
        where: whereCondition,

        select: {
          tai_khoan: true,
          ho_ten: true,
          email: true,
          so_dt: true,
          loai_nguoi_dung: true,
          ma_nhom: true,
        },

        orderBy: {
          tai_khoan: "asc",
        },

        skip: (currentPage - 1) * currentPageSize,
        take: currentPageSize,
      }),

      prisma.nguoiDung.count({
        where: whereCondition,
      }),
    ]);

    const tongSoTrang = Math.ceil(tongSoNguoiDung / currentPageSize);

    return {
      page: currentPage,
      pageSize: currentPageSize,
      totalItem: tongSoNguoiDung,
      totalPage: tongSoTrang,
      items: danhSachNguoiDung,
    };
  },

  // Lấy thông tin tài khoản đăng nhập Service
  async thongTinTaiKhoan(req) {
    const taiKhoan = req.nguoiDung?.tai_khoan;

    if (!taiKhoan) {
      throw new UnauthorizedError("Không tìm thấ tài khoản đăng nhập");
    }

    const nguoiDung = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: taiKhoan,
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
    });

    if (!nguoiDung) {
      throw new UnauthorizedError("Người dùng không tồn tại");
    }

    return nguoiDung;
  },

  // Lấy danh sách loại người dùng Service
  async layDanhSachLoaiNguoiDung(req) {
    const danhSachLoaiNguoiDung = await prisma.loaiNguoiDung.findMany({
      select: {
        ma_loai_nguoi_dung: true,
        ten_loai_nguoi_dung: true,
      },
      orderBy: {
        ma_loai_nguoi_dung: "asc",
      },
    });
    return danhSachLoaiNguoiDung;
  },

  // Tìm kiếm người dùng Service
  async timKiemNguoiDung(req) {
    const { ma_nhom, tu_khoa } = req.query;

    if (!ma_nhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được phép để trống");
    }

    if (!tu_khoa?.trim()) {
      throw new BadRequestError("Từ khóa không được phép để trống");
    }

    const maNhom = ma_nhom.trim();
    const keyword = tu_khoa.trim();

    const danhSachNguoiDung = await prisma.nguoiDung.findMany({
      where: {
        ma_nhom: maNhom,
        OR: [
          {
            tai_khoan: {
              contains: keyword,
            },
          },
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
        ],
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
      orderBy: {
        tai_khoan: "asc",
      },
    });
    return danhSachNguoiDung;
  },

  // Tìm kiếm người dùng phân trang Service
  async timKiemNguoiDungPhanTrang(req) {
    const { ma_nhom, tu_khoa, page = "1", pageSize = "10" } = req.query;

    if (!ma_nhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    if (!tu_khoa?.trim()) {
      throw new BadRequestError("Từ khóa không được để trống");
    }

    const currentPage = Number(page);
    const currentPageSize = Number(pageSize);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(currentPageSize) ||
      currentPageSize < 1
    ) {
      throw new BadRequestError("page và pageSize phải là số nguyên lớn hơn 0");
    }

    const maNhom = ma_nhom.trim();
    const keyword = tu_khoa.trim();

    const whereCondition = {
      ma_nhom: maNhom,
      OR: [
        {
          tai_khoan: {
            contains: keyword,
          },
        },
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
      ],
    };

    const [danhSachNguoiDung, tongSoNguoiDung] = await prisma.$transaction([
      prisma.nguoiDung.findMany({
        where: whereCondition,
        select: {
          tai_khoan: true,
          ho_ten: true,
          email: true,
          so_dt: true,
          loai_nguoi_dung: true,
          ma_nhom: true,
        },
        orderBy: {
          tai_khoan: "asc",
        },
        skip: (currentPage - 1) * currentPageSize,
        take: currentPageSize,
      }),

      prisma.nguoiDung.count({
        where: whereCondition,
      }),
    ]);

    const tongSoTrang = Math.ceil(tongSoNguoiDung / currentPageSize);

    return {
      page: currentPage,
      pageSize: currentPageSize,
      totalItem: tongSoNguoiDung,
      totalPage: tongSoTrang,
      items: danhSachNguoiDung,
    };
  },

  // Thêm người dùng Service
  async themNguoiDung(req) {
    const {
      tai_khoan,
      mat_khau,
      email,
      so_dt,
      ma_nhom,
      ho_ten,
      loai_nguoi_dung,
    } = req.body;

    if (
      !tai_khoan?.trim() ||
      !mat_khau.trim() ||
      !email?.trim() ||
      !ho_ten?.trim() ||
      !loai_nguoi_dung?.trim()
    ) {
      throw new BadRequestError("Các trường bắt buộc không được để trống");
    }

    const taiKhoan = tai_khoan.trim();
    const emailNguoiDung = email.trim();
    const hoTen = ho_ten.trim();
    const maNhom = ma_nhom?.trim() || "GP01";
    const loaiNguoiDung = loai_nguoi_dung.trim();

    // Kiểm tra tài khoản đã tồn tại
    const taiKhoanExisting = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: taiKhoan,
      },
    });

    if (taiKhoanExisting) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} đã tồn tại`);
    }

    // Kiểm tra email đã tồn tại
    const emailExisting = await prisma.nguoiDung.findUnique({
      where: {
        email: emailNguoiDung,
      },
    });

    if (emailExisting) {
      throw new BadRequestError(`Email ${emailNguoiDung} đã tồn tại`);
    }

    // Kiểm tra loại người dùng có tồn tại
    const loaiNguoiDungExisting = await prisma.loaiNguoiDung.findUnique({
      where: {
        ma_loai_nguoi_dung: loaiNguoiDung,
      },
    });

    if (!loaiNguoiDungExisting) {
      throw new BadRequestError(
        `Loại người dùng ${loaiNguoiDung} không tồn tại`,
      );
    }

    // Kiểm tra mã nhóm có tồn tại
    const nhomExisting = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
    });

    if (!nhomExisting) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

    const hashPassword = bcrypt.hashSync(mat_khau, 10);

    const nguoiDungMoi = await prisma.nguoiDung.create({
      data: {
        tai_khoan: taiKhoan,
        mat_khau: hashPassword,
        email: emailNguoiDung,
        so_dt: so_dt?.trim() || null,
        ma_nhom: maNhom,
        ho_ten: hoTen,
        loai_nguoi_dung: loaiNguoiDung,
      },

      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
    });

    return nguoiDungMoi;
  },

  // Cập nhật thông tin người dùng Service
  async capNhatThongTinNguoiDung(req) {
    const {
      tai_khoan,
      mat_khau,
      email,
      so_dt,
      ma_nhom,
      ho_ten,
      loai_nguoi_dung,
    } = req.body;

    if (!tai_khoan?.trim()) {
      throw new BadRequestError("Tài khoản không được để trống");
    }

    const taiKhoan = tai_khoan.trim();

    // Kiểm tra người dùng cần cập nhật có tồn tại
    const nguoiDungExisting = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: taiKhoan,
      },
    });

    if (!nguoiDungExisting) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} không tồn tại`);
    }

    // Kiểm tra email nếu Admin muốn cập nhật email
    if (email !== undefined) {
      if (!email?.trim()) {
        throw new BadRequestError("Email không được để trống");
      }

      const emailExisting = await prisma.nguoiDung.findFirst({
        where: {
          email: email.trim(),
          NOT: {
            tai_khoan: taiKhoan,
          },
        },
      });

      if (emailExisting) {
        throw new BadRequestError(`Email ${email.trim()} đã tồn tại`);
      }
    }

    // Kiểm tra họ tên nếu được gửi lên
    if (ho_ten !== undefined && !ho_ten?.trim()) {
      throw new BadRequestError("Họ tên không được để trống");
    }

    // Kiểm tra mật khẩu nếu được gửi lên
    if (mat_khau !== undefined && !mat_khau?.trim()) {
      throw new BadRequestError("Mật khẩu không được để trống");
    }

    // Kiểm tra loại người dùng nếu được gửi lên
    if (loai_nguoi_dung !== undefined) {
      if (!loai_nguoi_dung?.trim()) {
        throw new BadRequestError("Loại người dùng không được để trống");
      }

      const loaiNguoiDungExisting = await prisma.loaiNguoiDung.findUnique({
        where: {
          ma_loai_nguoi_dung: loai_nguoi_dung.trim(),
        },
      });

      if (!loaiNguoiDungExisting) {
        throw new BadRequestError(
          `Loại người dùng ${loai_nguoi_dung.trim()} không tồn tại`,
        );
      }
    }

    // Kiểm tra mã nhóm nếu được gửi lên
    if (ma_nhom !== undefined) {
      if (!ma_nhom?.trim()) {
        throw new BadRequestError("Mã nhóm không được để trống");
      }

      const nhomExisting = await prisma.nhom.findUnique({
        where: {
          ma_nhom: ma_nhom.trim(),
        },
      });

      if (!nhomExisting) {
        throw new BadRequestError(`Mã nhóm ${ma_nhom.trim()} không tồn tại`);
      }
    }

    const nguoiDungCapNhat = await prisma.nguoiDung.update({
      where: {
        tai_khoan: taiKhoan,
      },

      data: {
        ...(mat_khau !== undefined && {
          mat_khau: bcrypt.hashSync(mat_khau.trim(), 10),
        }),

        ...(email !== undefined && {
          email: email.trim(),
        }),

        ...(so_dt !== undefined && {
          so_dt: so_dt?.trim() || null,
        }),

        ...(ma_nhom !== undefined && {
          ma_nhom: ma_nhom.trim(),
        }),

        ...(ho_ten !== undefined && {
          ho_ten: ho_ten.trim(),
        }),

        ...(loai_nguoi_dung !== undefined && {
          loai_nguoi_dung: loai_nguoi_dung.trim(),
        }),
      },

      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
    });

    return nguoiDungCapNhat;
  },
};
