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

    const taiKhoan = tai_khoan?.trim();
    const matKhau = mat_khau?.trim();
    const emailNguoiDung = email?.trim().toLowerCase();
    const hoTen = ho_ten?.trim();
    const soDienThoai = so_dt?.trim() || null;
    const maNhom = ma_nhom?.trim() || "GP01";

    if (!taiKhoan || !matKhau || !emailNguoiDung || !hoTen) {
      throw new BadRequestError("Các trường bắt buộc không được để trống");
    }

    // Kiểm tra đồng thời tài khoản và email
    const nguoiDungExisting = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          {
            tai_khoan: taiKhoan,
          },
          {
            email: emailNguoiDung,
          },
        ],
      },
      select: {
        tai_khoan: true,
        email: true,
      },
    });

    if (nguoiDungExisting?.tai_khoan === taiKhoan) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} đã tồn tại`);
    }

    if (nguoiDungExisting?.email === emailNguoiDung) {
      throw new BadRequestError(`Email ${emailNguoiDung} đã tồn tại`);
    }

    // Kiểm tra mã nhóm có tồn tại
    const nhomExisting = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomExisting) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

    // Kiểm tra loại người dùng khách hàng có tồn tại
    const loaiNguoiDungExisting = await prisma.loaiNguoiDung.findUnique({
      where: {
        ma_loai_nguoi_dung: "KHACH_HANG",
      },
      select: {
        ma_loai_nguoi_dung: true,
      },
    });

    if (!loaiNguoiDungExisting) {
      throw new BadRequestError("Loại người dùng KHACH_HANG chưa tồn tại");
    }

    const hashPassword = await bcrypt.hash(matKhau, 10);

    const nguoiDungMoi = await prisma.nguoiDung.create({
      data: {
        tai_khoan: taiKhoan,
        mat_khau: hashPassword,
        email: emailNguoiDung,
        so_dt: soDienThoai,
        ma_nhom: maNhom,
        ho_ten: hoTen,
        loai_nguoi_dung: "KHACH_HANG",
      },
      select: {
        tai_khoan: true,
        email: true,
        so_dt: true,
        ma_nhom: true,
        ho_ten: true,
        loai_nguoi_dung: true,
      },
    });

    return nguoiDungMoi;
  },

  // Đăng ký Service
  async dangNhap(req) {
    const { tai_khoan, mat_khau } = req.body;

    if (!tai_khoan || !mat_khau) {
      throw new BadRequestError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
    }

    // Tìm người dùng theo tài khoản
    const existingTaiKhoan = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan,
      },
      select: {
        tai_khoan: true,
        ho_ten: true,
        email: true,
        so_dt: true,
        mat_khau: true,
        loai_nguoi_dung: true,
        ma_nhom: true,
      },
    });

    console.log(existingTaiKhoan);

    // Phải kiểm tra null trước khi đọc mat_khau
    if (!existingTaiKhoan) {
      throw new BadRequestError(
        "Thông tin người dùng không đúng, vui lòng thử lại",
      );
    }

    const isMatKhauValid = bcrypt.compareSync(
      mat_khau,
      existingTaiKhoan.mat_khau,
    );

    console.log(isMatKhauValid);

    if (!isMatKhauValid) {
      throw new BadRequestError(
        "Thông tin người dùng không đúng, vui lòng thử lại",
      );
    }

    const nguoiDung = {
      tai_khoan: existingTaiKhoan.tai_khoan,
      email: existingTaiKhoan.email,
      so_dt: existingTaiKhoan.so_dt,
      ma_nhom: existingTaiKhoan.ma_nhom,
      ho_ten: existingTaiKhoan.ho_ten,
      loai_nguoi_dung: existingTaiKhoan.loai_nguoi_dung,
    };

    const accessToken = signAccessToken(nguoiDung);
    const refreshToken = signRefreshToken(nguoiDung);

    return {
      accessToken,
      refreshToken,
      nguoiDung,
    };
  },

  // Lấy danh sách người dùng Service
  async layDanhSachNguoiDung(req) {
    const maNhom = req.query.ma_nhom?.trim();
    const keyword = req.query.tu_khoa?.trim();

    if (!maNhom) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    const nhomTonTai = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomTonTai) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

    const danhSachNguoiDung = await prisma.nguoiDung.findMany({
      where: {
        ma_nhom: maNhom,
        ...(keyword
          ? {
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
            }
          : {}),
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

    const maNhom = ma_nhom?.trim();
    const keyword = tu_khoa?.trim();

    if (!maNhom) {
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

    if (currentPageSize > 100) {
      throw new BadRequestError("pageSize không được lớn hơn 100");
    }

    const nhomTonTai = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomTonTai) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

    const whereCondition = {
      ma_nhom: maNhom,
      ...(keyword
        ? {
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
          }
        : {}),
    };

    const skip = (currentPage - 1) * currentPageSize;

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
        skip,
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

    const maNhom = ma_nhom?.trim();
    const keyword = tu_khoa?.trim();
    const currentPage = Number(page);
    const currentPageSize = Number(pageSize);

    if (!maNhom) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    if (!keyword) {
      throw new BadRequestError("Từ khóa không được để trống");
    }

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(currentPageSize) ||
      currentPageSize < 1
    ) {
      throw new BadRequestError("page và pageSize phải là số nguyên lớn hơn 0");
    }

    if (currentPageSize > 100) {
      throw new BadRequestError("pageSize không được lớn hơn 100");
    }

    const nhomTonTai = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomTonTai) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

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

    const skip = (currentPage - 1) * currentPageSize;

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
        skip,
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

    const taiKhoan = tai_khoan?.trim();
    const matKhau = mat_khau?.trim();
    const emailNguoiDung = email?.trim().toLowerCase();
    const soDienThoai = so_dt?.trim() || null;
    const maNhom = ma_nhom?.trim() || "GP01";
    const hoTen = ho_ten?.trim();
    const loaiNguoiDung = loai_nguoi_dung?.trim();

    if (!taiKhoan || !matKhau || !emailNguoiDung || !hoTen || !loaiNguoiDung) {
      throw new BadRequestError("Các trường bắt buộc không được để trống");
    }

    // Kiểm tra tài khoản hoặc email đã tồn tại
    const nguoiDungExisting = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          {
            tai_khoan: taiKhoan,
          },
          {
            email: emailNguoiDung,
          },
        ],
      },
      select: {
        tai_khoan: true,
        email: true,
      },
    });

    if (nguoiDungExisting?.tai_khoan === taiKhoan) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} đã tồn tại`);
    }

    if (nguoiDungExisting?.email === emailNguoiDung) {
      throw new BadRequestError(`Email ${emailNguoiDung} đã tồn tại`);
    }

    // Kiểm tra loại người dùng và mã nhóm cùng lúc
    const [loaiNguoiDungExisting, nhomExisting] = await prisma.$transaction([
      prisma.loaiNguoiDung.findUnique({
        where: {
          ma_loai_nguoi_dung: loaiNguoiDung,
        },
        select: {
          ma_loai_nguoi_dung: true,
        },
      }),

      prisma.nhom.findUnique({
        where: {
          ma_nhom: maNhom,
        },
        select: {
          ma_nhom: true,
        },
      }),
    ]);

    if (!loaiNguoiDungExisting) {
      throw new BadRequestError(
        `Loại người dùng ${loaiNguoiDung} không tồn tại`,
      );
    }

    if (!nhomExisting) {
      throw new BadRequestError(`Mã nhóm ${maNhom} không tồn tại`);
    }

    const hashPassword = await bcrypt.hash(matKhau, 10);

    const nguoiDungMoi = await prisma.nguoiDung.create({
      data: {
        tai_khoan: taiKhoan,
        mat_khau: hashPassword,
        email: emailNguoiDung,
        so_dt: soDienThoai,
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

    const taiKhoan = tai_khoan?.trim();

    if (!taiKhoan) {
      throw new BadRequestError("Tài khoản không được để trống");
    }

    const nguoiDungExisting = await prisma.nguoiDung.findUnique({
      where: {
        tai_khoan: taiKhoan,
      },
      select: {
        tai_khoan: true,
      },
    });

    if (!nguoiDungExisting) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} không tồn tại`);
    }

    const dataCapNhat = {};

    // Cập nhật email
    if (email !== undefined) {
      const emailMoi = email?.trim().toLowerCase();

      if (!emailMoi) {
        throw new BadRequestError("Email không được để trống");
      }

      const emailExisting = await prisma.nguoiDung.findFirst({
        where: {
          email: emailMoi,
          NOT: {
            tai_khoan: taiKhoan,
          },
        },
        select: {
          tai_khoan: true,
        },
      });

      if (emailExisting) {
        throw new BadRequestError(`Email ${emailMoi} đã tồn tại`);
      }

      dataCapNhat.email = emailMoi;
    }

    // Cập nhật họ tên
    if (ho_ten !== undefined) {
      const hoTenMoi = ho_ten?.trim();

      if (!hoTenMoi) {
        throw new BadRequestError("Họ tên không được để trống");
      }

      dataCapNhat.ho_ten = hoTenMoi;
    }

    // Cập nhật mật khẩu
    if (mat_khau !== undefined) {
      const matKhauMoi = mat_khau?.trim();

      if (!matKhauMoi) {
        throw new BadRequestError("Mật khẩu không được để trống");
      }

      dataCapNhat.mat_khau = await bcrypt.hash(matKhauMoi, 10);
    }

    // Cập nhật số điện thoại
    if (so_dt !== undefined) {
      dataCapNhat.so_dt = so_dt?.trim() || null;
    }

    // Cập nhật loại người dùng
    if (loai_nguoi_dung !== undefined) {
      const loaiNguoiDungMoi = loai_nguoi_dung?.trim();

      if (!loaiNguoiDungMoi) {
        throw new BadRequestError("Loại người dùng không được để trống");
      }

      const loaiNguoiDungExisting = await prisma.loaiNguoiDung.findUnique({
        where: {
          ma_loai_nguoi_dung: loaiNguoiDungMoi,
        },
        select: {
          ma_loai_nguoi_dung: true,
        },
      });

      if (!loaiNguoiDungExisting) {
        throw new BadRequestError(
          `Loại người dùng ${loaiNguoiDungMoi} không tồn tại`,
        );
      }

      dataCapNhat.loai_nguoi_dung = loaiNguoiDungMoi;
    }

    // Cập nhật mã nhóm
    if (ma_nhom !== undefined) {
      const maNhomMoi = ma_nhom?.trim();

      if (!maNhomMoi) {
        throw new BadRequestError("Mã nhóm không được để trống");
      }

      const nhomExisting = await prisma.nhom.findUnique({
        where: {
          ma_nhom: maNhomMoi,
        },
        select: {
          ma_nhom: true,
        },
      });

      if (!nhomExisting) {
        throw new BadRequestError(`Mã nhóm ${maNhomMoi} không tồn tại`);
      }

      dataCapNhat.ma_nhom = maNhomMoi;
    }

    if (Object.keys(dataCapNhat).length === 0) {
      throw new BadRequestError("Không có thông tin nào để cập nhật");
    }

    const nguoiDungCapNhat = await prisma.nguoiDung.update({
      where: {
        tai_khoan: taiKhoan,
      },
      data: dataCapNhat,
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

  // Xóa người dùng Service
  async xoaNguoiDung(req) {
    const taiKhoan = req.query.tai_khoan?.trim();

    if (!taiKhoan) {
      throw new BadRequestError("Tài khoản không được để trống");
    }

    const nguoiDungExisting = await prisma.nguoiDung.findUnique({
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
        _count: {
          select: {
            DatVe: true,
          },
        },
      },
    });

    if (!nguoiDungExisting) {
      throw new BadRequestError(`Tài khoản ${taiKhoan} không tồn tại`);
    }

    if (nguoiDungExisting._count.DatVe > 0) {
      throw new BadRequestError(
        `Không thể xóa tài khoản ${taiKhoan} vì người dùng đã có lịch sử đặt vé`,
      );
    }

    const nguoiDungDaXoa = await prisma.nguoiDung.delete({
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

    return nguoiDungDaXoa;
  },
};
