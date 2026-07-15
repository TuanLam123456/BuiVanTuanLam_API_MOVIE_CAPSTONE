import { BadRequestError } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const rapService = {
  // Lấy thông tin hệ thống rạp Service
  async layThongTinHeThongRap(req) {
    const { maHeThongRap } = req.query;

    // Không truyền mã hệ thống rạp thì lấy toàn bộ
    if (!maHeThongRap) {
      const danhSachHeThongRap = await prisma.heThongRap.findMany({
        select: {
          ma_he_thong_rap: true,
          ten_he_thong_rap: true,
          logo: true,
        },
        orderBy: {
          ma_he_thong_rap: "asc",
        },
      });
      return danhSachHeThongRap;
    }

    const maHeThongRapNumber = Number(maHeThongRap);

    if (!Number.isInteger(maHeThongRapNumber) || maHeThongRapNumber < 1) {
      throw new BadRequestError("Mã hệ thống rạp phải là số nguyên lớn hơn 0");
    }

    const heThongRap = await prisma.heThongRap.findUnique({
      where: {
        ma_he_thong_rap: maHeThongRapNumber,
      },

      select: {
        ma_he_thong_rap: true,
        ten_he_thong_rap: true,
        logo: true,
      },
    });

    if (!heThongRap) {
      throw new BadRequestError(
        `Không tìm thấy hệ thống rạp có mã ${maHeThongRapNumber}`,
      );
    }

    return heThongRap;
  },

  // Lấy thông tin cụm rạp theo hệ thống Service
  async layThongTinCumRapTheoHeThong(req) {
    const { maHeThongRap } = req.query;

    if (!maHeThongRap?.trim()) {
      throw new BadRequestError("Mã hệ thống rạp không được để trống");
    }

    const maHeThongRapNumber = Number(maHeThongRap);

    if (!Number.isInteger(maHeThongRapNumber) || maHeThongRapNumber < 1) {
      throw new BadRequestError("Mã hệ thống phải là số nguyên tố lớn hơn 0");
    }

    const heThongRap = await prisma.heThongRap.findUnique({
      where: {
        ma_he_thong_rap: maHeThongRapNumber,
      },
    });

    if (!heThongRap) {
      throw new BadRequestError("Hệ thống rạp không tồn tại");
    }

    const danhSachCumRap = await prisma.cumRap.findMany({
      where: {
        ma_he_thong_rap: maHeThongRapNumber,
      },
      select: {
        ma_cum_rap: true,
        ten_cum_rap: true,
        dia_chi: true,
        RapPhim: {
          select: {
            ma_rap: true,
            ten_rap: true,
          },
          orderBy: {
            ma_rap: "asc",
          },
        },
      },
      orderBy: {
        ma_cum_rap: "asc",
      },
    });

    return danhSachCumRap.map((cumRap) => ({
      ma_cum_rap: cumRap.ma_cum_rap,
      ten_cum_rap: cumRap.ten_cum_rap,
      dia_chi: cumRap.dia_chi,
      danh_sach_rap: cumRap.RapPhim.map((rap) => ({
        ma_rap: rap.ma_rap,
        ten_rap: rap.ten_rap,
      })),
    }));
  },
};
