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
};
