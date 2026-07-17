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
        ma_banner: 'asc'
      }
    });
    return danhSachBanner;
  },
};
