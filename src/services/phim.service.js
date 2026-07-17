import { BadRequestError } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const phimService = {
  // Lấy danh sách Banner Service
  async layDanhSachBanner() {
    const danhSachBanner = await prisma.banner.findMany({
      select: {
        ma_banner: true,
        ma_phim: true,
        hinh_anh: true,
      },
      orderBy: {
        ma_banner: "asc",
      },
    });
    return danhSachBanner;
  },

  // Lấy danh sách phim Service
  async layDanhSachPhim(req) {
    const { maNhom, tenPhim } = req.query;

    if (!maNhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được phép để trống");
    }

    const nhomTonTai = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom.trim(),
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomTonTai) {
      throw new BadRequestError(`Nhóm có mã ${maNhom.trim()} không tồn tại`);
    }

    const danhSachPhim = await prisma.phim.findMany({
      where: {
        Nhom: {
          ma_nhom: maNhom.trim(),
        },
        ...(tenPhim?.trim() && {
          ten_phim: {
            contains: tenPhim.trim(),
          },
        }),
      },

      select: {
        ma_phim: true,
        ten_phim: true,
        trailer: true,
        hinh_anh: true,
        mo_ta: true,
        ngay_khoi_chieu: true,
        danh_gia: true,
        hot: true,
        dang_chieu: true,
        sap_chieu: true,
      },

      orderBy: {
        ma_phim: "desc",
      },
    });

    return danhSachPhim.map((phim) => ({
      maPhim: phim.ma_phim,
      tenPhim: phim.ten_phim,
      trailer: phim.trailer,
      hinhAnh: phim.hinh_anh,
      moTa: phim.mo_ta,
      maNhom: maNhom.trim(),
      ngayKhoiChieu: phim.ngay_khoi_chieu,
      danhGia: phim.danh_gia,
      hot: phim.hot,
      dangChieu: phim.dang_chieu,
      sapChieu: phim.sap_chieu,
    }));
  },

  // Lấy danh sách phim phân trang Service
  async layDanhSachPhimPhanTrang(req) {
    const { maNhom, tenPhim, page = "1", pageSize = "10" } = req.query;

    if (!maNhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được phép để trống");
    }

    const maNhomValue = maNhom.trim();
    const tenPhimValue = tenPhim?.trim();

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new BadRequestError("Page phải là số nguyên lớn hơn 0");
    }

    if (!Number.isInteger(pageSizeNumber) || pageSizeNumber < 1) {
      throw new BadRequestError("PageSize phải là số nguyên lớn hơn 0");
    }

    const nhomTonTai = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhomValue,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomTonTai) {
      throw new BadRequestError(`Nhóm có mã ${maNhomValue} không tồn tại`);
    }

    const whereCondition = {
      Nhom: {
        is: {
          ma_nhom: maNhomValue,
        },
      },

      ...(tenPhimValue && {
        ten_phim: {
          contains: tenPhimValue,
        },
      }),
    };

    const [danhSachPhim, tongSoPhim] = await prisma.$transaction([
      prisma.phim.findMany({
        where: whereCondition,

        skip: (pageNumber - 1) * pageSizeNumber,
        take: pageSizeNumber,

        select: {
          ma_phim: true,
          ten_phim: true,
          trailer: true,
          hinh_anh: true,
          mo_ta: true,
          ngay_khoi_chieu: true,
          danh_gia: true,
          hot: true,
          dang_chieu: true,
          sap_chieu: true,
        },

        orderBy: {
          ma_phim: "desc",
        },
      }),

      prisma.phim.count({
        where: whereCondition,
      }),
    ]);

    const tongSoTrang = Math.ceil(tongSoPhim / pageSizeNumber);

    return {
      currentPage: pageNumber,
      count: tongSoPhim,
      totalPages: tongSoTrang,
      items: danhSachPhim.map((phim) => ({
        maPhim: phim.ma_phim,
        tenPhim: phim.ten_phim,
        trailer: phim.trailer,
        hinhAnh: phim.hinh_anh,
        moTa: phim.mo_ta,
        maNhom: maNhomValue,
        ngayKhoiChieu: phim.ngay_khoi_chieu,
        danhGia: phim.danh_gia,
        hot: phim.hot,
        dangChieu: phim.dang_chieu,
        sapChieu: phim.sap_chieu,
      })),
    };
  },

  // Lấy danh sách phim phân trang theo ngày Service
};
