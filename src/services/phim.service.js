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

  // Lấy danh sachq phim Service
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
};
