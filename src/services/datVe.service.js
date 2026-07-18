import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../common/helpers/exception.helper.js";
import { randomUUID } from "node:crypto";
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

    const maLichChieuString = String(maLichChieu || "").trim();

    if (!maLichChieuString) {
      throw new BadRequestError("Mã lịch chiếu không hợp lệ");
    }

    if (!Array.isArray(danhSachVe) || danhSachVe.length === 0) {
      throw new BadRequestError("Danh sách vé phải có ít nhất một ghế");
    }

    const danhSachVeDaXuLy = danhSachVe.map((ve, index) => {
      const maGhe = String(ve?.maGhe || "").trim();
      const giaVe = Number(ve?.giaVe);

      if (!maGhe) {
        throw new BadRequestError(
          `Mã ghế tại vị trí ${index + 1} không hợp lệ`,
        );
      }

      if (!Number.isInteger(giaVe) || giaVe < 0) {
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
      throw new BadRequestError("Danh sách vé có ghế bị trùng lặp");
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
          ma_lich_chieu: maLichChieuString,
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
          `Lịch chiếu ${maLichChieuString} không tồn tại`,
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
        const danhSachGheHopLe = new Set(danhSachGhe.map((ghe) => ghe.ma_ghe));

        const danhSachGheKhongHopLe = danhSachMaGheKhongTrung.filter(
          (maGhe) => !danhSachGheHopLe.has(maGhe),
        );

        throw new BadRequestError(
          `Các ghế sau không tồn tại hoặc không thuộc rạp của lịch chiếu: ${danhSachGheKhongHopLe.join(", ")}`,
        );
      }

      // Kiểm tra ghế đã được đặt trong lịch chiếu
      const danhSachGheDaDat = await tx.datVe.findMany({
        where: {
          ma_lich_chieu: maLichChieuString,
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

        throw new BadRequestError(`Ghế ${tenGheDaDat} đã được đặt`);
      }

      // Tạo các bản ghi đặt vé
      const thoiDiemTao = Date.now();

      await tx.datVe.createMany({
        data: danhSachMaGheKhongTrung.map((maGhe, index) => ({
          ma_dat_ve: `DV_${thoiDiemTao}_${index + 1}`,
          tai_khoan: taiKhoan,
          ma_lich_chieu: maLichChieuString,
          ma_ghe: maGhe,
        })),
      });
      
      return {
        tai_khoan: taiKhoan,
        maLichChieu: lichChieuExisting.ma_lich_chieu,
        tenPhim: lichChieuExisting.Phim.ten_phim,
        ngayGioChieu: lichChieuExisting.ngay_gio_chieu,
        tenRap: lichChieuExisting.RapPhim.ten_rap,
        tenCumRap: lichChieuExisting.RapPhim.CumRap.ten_cum_rap,
        diaChi: lichChieuExisting.RapPhim.CumRap.dia_chi,
        giaVe: lichChieuExisting.gia_ve,
        tongTien: lichChieuExisting.gia_ve * danhSachMaGheKhongTrung.length,
        danhSachGhe: danhSachGhe.map((ghe) => ({
          maGhe: ghe.ma_ghe,
          tenGhe: ghe.ten_ghe,
          loaiGhe: ghe.loai_ghe,
        })),
      };
    });

    return ketQuaDatVe;
  },

  // Lấy danh sách phòng vé Service
  async layDanhSachPhongVe(req) {
    const { ma_lich_chieu } = req.query;

    const maLichChieu = String(ma_lich_chieu || "").trim();

    if (!maLichChieu) {
      throw new BadRequestError("Mã lịch chiếu không được để trống");
    }

    const lichChieu = await prisma.lichChieu.findUnique({
      where: {
        ma_lich_chieu: maLichChieu,
      },

      select: {
        ma_lich_chieu: true,
        ngay_gio_chieu: true,
        gia_ve: true,

        Phim: {
          select: {
            ma_phim: true,
            ten_phim: true,
            hinh_anh: true,
          },
        },

        RapPhim: {
          select: {
            ma_rap: true,
            ten_rap: true,

            CumRap: {
              select: {
                ma_cum_rap: true,
                ten_cum_rap: true,
                dia_chi: true,

                HeThongRap: {
                  select: {
                    ma_he_thong_rap: true,
                    ten_he_thong_rap: true,
                    logo: true,
                  },
                },
              },
            },

            Ghe: {
              select: {
                ma_ghe: true,
                ten_ghe: true,
                loai_ghe: true,
              },

              orderBy: {
                ma_ghe: "asc",
              },
            },
          },
        },

        DatVe: {
          select: {
            ma_ghe: true,
            tai_khoan: true,

            NguoiDung: {
              select: {
                tai_khoan: true,
                ho_ten: true,
              },
            },
          },
        },
      },
    });

    if (!lichChieu) {
      throw new BadRequestError(`Lịch chiếu ${maLichChieu} không tồn tại`);
    }

    const danhSachGheDaDat = new Map(
      lichChieu.DatVe.map((datVe) => [
        datVe.ma_ghe,
        {
          taiKhoan: datVe.tai_khoan,
          hoTen: datVe.NguoiDung.ho_ten,
        },
      ]),
    );

    const danhSachGhe = lichChieu.RapPhim.Ghe.map((ghe) => {
      const thongTinDatVe = danhSachGheDaDat.get(ghe.ma_ghe);

      return {
        maGhe: ghe.ma_ghe,
        tenGhe: ghe.ten_ghe,
        loaiGhe: ghe.loai_ghe,
        giaVe: lichChieu.gia_ve,
        daDat: Boolean(thongTinDatVe),
        taiKhoanNguoiDat: thongTinDatVe?.taiKhoan || null,
        hoTenNguoiDat: thongTinDatVe?.hoTen || null,
      };
    });

    return {
      thongTinPhim: {
        maLichChieu: lichChieu.ma_lich_chieu,
        maPhim: lichChieu.Phim.ma_phim,
        tenPhim: lichChieu.Phim.ten_phim,
        hinhAnh: lichChieu.Phim.hinh_anh,
        ngayGioChieu: lichChieu.ngay_gio_chieu,
        giaVe: lichChieu.gia_ve,

        thongTinRap: {
          maRap: lichChieu.RapPhim.ma_rap,
          tenRap: lichChieu.RapPhim.ten_rap,
          maCumRap: lichChieu.RapPhim.CumRap.ma_cum_rap,
          tenCumRap: lichChieu.RapPhim.CumRap.ten_cum_rap,
          diaChi: lichChieu.RapPhim.CumRap.dia_chi,
          maHeThongRap: lichChieu.RapPhim.CumRap.HeThongRap.ma_he_thong_rap,
          tenHeThongRap: lichChieu.RapPhim.CumRap.HeThongRap.ten_he_thong_rap,
          logo: lichChieu.RapPhim.CumRap.HeThongRap.logo,
        },
      },

      danhSachGhe,
    };
  },

  // Tạo lịch chiếu Service
  async taoLichChieu(req) {
    const { maPhim, ngayChieuGioChieu, maRap, giaVe } = req.body || {};

    const maPhimString = String(maPhim || "").trim();
    const maRapString = String(maRap || "").trim();
    const ngayChieuGioChieuString = String(ngayChieuGioChieu || "").trim();

    if (
      !maPhimString ||
      !ngayChieuGioChieuString ||
      !maRapString ||
      giaVe === undefined
    ) {
      throw new BadRequestError(
        "Mã phim, ngày chiếu giờ chiếu, mã rạp và giá vé không được để trống",
      );
    }

    const giaVeNumber = Number(giaVe);

    if (!Number.isInteger(giaVeNumber) || giaVeNumber < 1) {
      throw new BadRequestError("Giá vé phải là số nguyên lớn hơn 0");
    }

    const ngayGioChieu = new Date(ngayChieuGioChieuString);

    if (Number.isNaN(ngayGioChieu.getTime())) {
      throw new BadRequestError("Ngày chiếu giờ chiếu không đúng định dạng");
    }

    if (ngayGioChieu <= new Date()) {
      throw new BadRequestError(
        "Ngày giờ chiếu phải lớn hơn thời gian hiện tại",
      );
    }

    const [phimExisting, rapExisting] = await prisma.$transaction([
      prisma.phim.findUnique({
        where: {
          ma_phim: maPhimString,
        },

        select: {
          ma_phim: true,
          ten_phim: true,
        },
      }),

      prisma.rapPhim.findUnique({
        where: {
          ma_rap: maRapString,
        },

        select: {
          ma_rap: true,
          ten_rap: true,
          ma_cum_rap: true,
        },
      }),
    ]);

    if (!phimExisting) {
      throw new BadRequestError(`Phim có mã ${maPhimString} không tồn tại`);
    }

    if (!rapExisting) {
      throw new BadRequestError(`Rạp có mã ${maRapString} không tồn tại`);
    }

    // Kiểm tra rạp đã có lịch chiếu đúng thời điểm đó chưa
    const lichChieuTrung = await prisma.lichChieu.findFirst({
      where: {
        ma_rap: maRapString,
        ngay_gio_chieu: ngayGioChieu,
      },
    });

    if (lichChieuTrung) {
      throw new BadRequestError("Rạp đã có lịch chiếu vào thời gian này");
    }

    const lichChieuMoi = await prisma.lichChieu.create({
      data: {
        ma_lich_chieu: randomUUID(),
        ma_phim: maPhimString,
        ma_rap: maRapString,
        ngay_gio_chieu: ngayGioChieu,
        gia_ve: giaVeNumber,
      },

      select: {
        ma_lich_chieu: true,
        ma_phim: true,
        ma_rap: true,
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
              },
            },
          },
        },
      },
    });

    return {
      maLichChieu: lichChieuMoi.ma_lich_chieu,
      maPhim: lichChieuMoi.ma_phim,
      tenPhim: lichChieuMoi.Phim.ten_phim,
      maRap: lichChieuMoi.ma_rap,
      tenRap: lichChieuMoi.RapPhim.ten_rap,
      tenCumRap: lichChieuMoi.RapPhim.CumRap.ten_cum_rap,
      ngayChieuGioChieu: lichChieuMoi.ngay_gio_chieu,
      giaVe: lichChieuMoi.gia_ve,
    };
  },
};
