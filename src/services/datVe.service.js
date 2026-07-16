import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../common/helpers/exception.helper.js";

export const datVeService = {
  // Đặt vé Service
  async datVe(req) {
    const taiKhoan = req.nguoiDung?.tai_khoan;
    const { maLichChieu, danhSachVe } = req.body;

    if (!taiKhoan) {
      throw new UnauthorizedError(
        "Không tìm thấy thông tin tài khoản đăng nhập",
      );
    }

    const maLichChieuNumber = Number(maLichChieu);

    if (
      !Number.isInteger(maLichChieuNumber) ||
      maLichChieuNumber < 1
    ) {
      throw new BadRequestError(
        "Mã lịch chiếu phải là số nguyên lớn hơn 0",
      );
    }

    if (!Array.isArray(danhSachVe) || danhSachVe.length === 0) {
      throw new BadRequestError(
        "Danh sách vé phải có ít nhất một ghế",
      );
    }

    const danhSachVeDaXuLy = danhSachVe.map((ve, index) => {
      const maGhe = Number(ve?.maGhe);
      const giaVe = Number(ve?.giaVe);

      if (!Number.isInteger(maGhe) || maGhe < 1) {
        throw new BadRequestError(
          `Mã ghế tại vị trí ${index + 1} không hợp lệ`,
        );
      }

      if (
        !Number.isInteger(giaVe) ||
        giaVe < 0
      ) {
        throw new BadRequestError(
          `Giá vé tại vị trí ${index + 1} không hợp lệ`,
        );
      }

      return {
        maGhe,
        giaVe,
      };
    });

    // Kiểm tra có gửi trùng ghế trong cùng request hay không
    const danhSachMaGhe = danhSachVeDaXuLy.map((ve) => ve.maGhe);
    const danhSachMaGheKhongTrung = [...new Set(danhSachMaGhe)];

    if (danhSachMaGheKhongTrung.length !== danhSachMaGhe.length) {
      throw new BadRequestError(
        "Danh sách vé có ghế bị trùng lặp",
      );
    }

    const ketQuaDatVe = await prisma.$transaction(async (tx) => {
      // Kiểm tra người dùng còn tồn tại
      const nguoiDungExisting = await tx.nguoiDung.findUnique({
        where: {
          tai_khoan: taiKhoan,
        },
        select: {
          tai_khoan: true,
        },
      });

      if (!nguoiDungExisting) {
        throw new UnauthorizedError("Người dùng không tồn tại");
      }

      // Kiểm tra lịch chiếu
      const lichChieuExisting = await tx.lichChieu.findUnique({
        where: {
          ma_lich_chieu: maLichChieuNumber,
        },
        select: {
          ma_lich_chieu: true,
          ma_rap: true,
          ma_phim: true,
          ngay_gio_chieu: true,
          gia_ve: true,
          Phim: {
            select: {
              ten_phim: true,
            },
          },
          RapPhim: {
            select: {
              ten_rap: true,
              CumRap: {
                select: {
                  ten_cum_rap: true,
                  dia_chi: true,
                },
              },
            },
          },
        },
      });

      if (!lichChieuExisting) {
        throw new BadRequestError(
          `Lịch chiếu ${maLichChieuNumber} không tồn tại`,
        );
      }

      // Kiểm tra giá vé
      const veSaiGia = danhSachVeDaXuLy.find(
        (ve) => ve.giaVe !== lichChieuExisting.gia_ve,
      );

      if (veSaiGia) {
        throw new BadRequestError(
          `Giá vé không hợp lệ. Giá vé của lịch chiếu là ${lichChieuExisting.gia_ve}`,
        );
      }

      // Lấy các ghế thuộc đúng rạp của lịch chiếu
      const danhSachGhe = await tx.ghe.findMany({
        where: {
          ma_ghe: {
            in: danhSachMaGheKhongTrung,
          },
          ma_rap: lichChieuExisting.ma_rap,
        },
        select: {
          ma_ghe: true,
          ten_ghe: true,
          loai_ghe: true,
          ma_rap: true,
        },
      });

      if (danhSachGhe.length !== danhSachMaGheKhongTrung.length) {
        const danhSachGheHopLe = new Set(
          danhSachGhe.map((ghe) => ghe.ma_ghe),
        );

        const danhSachGheKhongHopLe =
          danhSachMaGheKhongTrung.filter(
            (maGhe) => !danhSachGheHopLe.has(maGhe),
          );

        throw new BadRequestError(
          `Các ghế sau không tồn tại hoặc không thuộc rạp của lịch chiếu: ${danhSachGheKhongHopLe.join(", ")}`,
        );
      }

      // Kiểm tra ghế đã được đặt trong lịch chiếu
      const danhSachGheDaDat = await tx.datVe.findMany({
        where: {
          ma_lich_chieu: maLichChieuNumber,
          ma_ghe: {
            in: danhSachMaGheKhongTrung,
          },
        },
        select: {
          ma_ghe: true,
          Ghe: {
            select: {
              ten_ghe: true,
            },
          },
        },
      });

      if (danhSachGheDaDat.length > 0) {
        const tenGheDaDat = danhSachGheDaDat
          .map((datVe) => datVe.Ghe.ten_ghe)
          .join(", ");

        throw new BadRequestError(
          `Ghế ${tenGheDaDat} đã được đặt`,
        );
      }

      // Tạo các bản ghi đặt vé
      await tx.datVe.createMany({
        data: danhSachMaGheKhongTrung.map((maGhe) => ({
          tai_khoan: taiKhoan,
          ma_lich_chieu: maLichChieuNumber,
          ma_ghe: maGhe,
        })),
      });

      return {
        tai_khoan: taiKhoan,
        maLichChieu: lichChieuExisting.ma_lich_chieu,
        tenPhim: lichChieuExisting.Phim.ten_phim,
        ngayGioChieu: lichChieuExisting.ngay_gio_chieu,
        tenRap: lichChieuExisting.RapPhim.ten_rap,
        tenCumRap:
          lichChieuExisting.RapPhim.CumRap.ten_cum_rap,
        diaChi:
          lichChieuExisting.RapPhim.CumRap.dia_chi,
        giaVe: lichChieuExisting.gia_ve,
        tongTien:
          lichChieuExisting.gia_ve *
          danhSachMaGheKhongTrung.length,
        danhSachGhe: danhSachGhe.map((ghe) => ({
          maGhe: ghe.ma_ghe,
          tenGhe: ghe.ten_ghe,
          loaiGhe: ghe.loai_ghe,
        })),
      };
    });

    return ketQuaDatVe;
  },
};