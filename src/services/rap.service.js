import { BadRequestError } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const rapService = {
  // Lấy thông tin hệ thống rạp Service
  async layThongTinHeThongRap(req) {
    const maHeThongRap = req.query.maHeThongRap?.trim();

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

    const heThongRap = await prisma.heThongRap.findUnique({
      where: {
        ma_he_thong_rap: maHeThongRap,
      },
      select: {
        ma_he_thong_rap: true,
        ten_he_thong_rap: true,
        logo: true,
      },
    });

    if (!heThongRap) {
      throw new BadRequestError(
        `Không tìm thấy hệ thống rạp có mã ${maHeThongRap}`,
      );
    }

    return heThongRap;
  },

  // Lấy thông tin cụm rạp theo hệ thống Service
  async layThongTinCumRapTheoHeThong(req) {
    const maHeThongRap = req.query.maHeThongRap?.trim();

    if (!maHeThongRap) {
      throw new BadRequestError("Mã hệ thống rạp không được để trống");
    }

    const heThongRap = await prisma.heThongRap.findUnique({
      where: {
        ma_he_thong_rap: maHeThongRap,
      },
      select: {
        ma_he_thong_rap: true,
      },
    });

    if (!heThongRap) {
      throw new BadRequestError(`Hệ thống rạp ${maHeThongRap} không tồn tại`);
    }

    const danhSachCumRap = await prisma.cumRap.findMany({
      where: {
        ma_he_thong_rap: maHeThongRap,
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

  // Lấy thông tin lịch chiếu hệ thống rạp Service
  async layThongTinLichChieuHeThongRap(req) {
    const maNhom = req.query.ma_nhom?.trim();
    const maHeThongRap = req.query.maHeThongRap?.trim();

    if (!maNhom) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    const nhomExists = await prisma.nhom.findUnique({
      where: {
        ma_nhom: maNhom,
      },
      select: {
        ma_nhom: true,
      },
    });

    if (!nhomExists) {
      throw new BadRequestError(`Nhóm ${maNhom} không tồn tại`);
    }

    // Chỉ kiểm tra hệ thống rạp khi client có truyền mã
    if (maHeThongRap) {
      const heThongRapExists = await prisma.heThongRap.findUnique({
        where: {
          ma_he_thong_rap: maHeThongRap,
        },
        select: {
          ma_he_thong_rap: true,
        },
      });

      if (!heThongRapExists) {
        throw new BadRequestError(
          `Không tìm thấy hệ thống rạp có mã ${maHeThongRap}`,
        );
      }
    }

    const dieuKienLichChieuTheoNhom = {
      Phim: {
        ma_nhom: maNhom,
      },
    };

    const danhSachHeThongRap = await prisma.heThongRap.findMany({
      where: {
        ...(maHeThongRap
          ? {
              ma_he_thong_rap: maHeThongRap,
            }
          : {}),

        CumRap: {
          some: {
            RapPhim: {
              some: {
                LichChieu: {
                  some: dieuKienLichChieuTheoNhom,
                },
              },
            },
          },
        },
      },

      select: {
        ma_he_thong_rap: true,
        ten_he_thong_rap: true,
        logo: true,

        CumRap: {
          where: {
            RapPhim: {
              some: {
                LichChieu: {
                  some: dieuKienLichChieuTheoNhom,
                },
              },
            },
          },

          select: {
            ma_cum_rap: true,
            ten_cum_rap: true,
            dia_chi: true,

            RapPhim: {
              where: {
                LichChieu: {
                  some: dieuKienLichChieuTheoNhom,
                },
              },

              select: {
                ma_rap: true,
                ten_rap: true,

                LichChieu: {
                  where: dieuKienLichChieuTheoNhom,

                  select: {
                    ma_lich_chieu: true,
                    ma_rap: true,
                    ma_phim: true,
                    ngay_gio_chieu: true,
                    gia_ve: true,

                    Phim: {
                      select: {
                        ma_phim: true,
                        ten_phim: true,
                        hinh_anh: true,
                        hot: true,
                        dang_chieu: true,
                        sap_chieu: true,
                      },
                    },
                  },

                  orderBy: {
                    ngay_gio_chieu: "asc",
                  },
                },
              },

              orderBy: {
                ma_rap: "asc",
              },
            },
          },

          orderBy: {
            ma_cum_rap: "asc",
          },
        },
      },

      orderBy: {
        ma_he_thong_rap: "asc",
      },
    });

    return danhSachHeThongRap.map((heThongRap) => ({
      maHeThongRap: heThongRap.ma_he_thong_rap,
      tenHeThongRap: heThongRap.ten_he_thong_rap,
      logo: heThongRap.logo,

      lstCumRap: heThongRap.CumRap.map((cumRap) => {
        const danhSachPhimMap = new Map();

        for (const rap of cumRap.RapPhim) {
          for (const lichChieu of rap.LichChieu) {
            const phim = lichChieu.Phim;

            if (!danhSachPhimMap.has(phim.ma_phim)) {
              danhSachPhimMap.set(phim.ma_phim, {
                maPhim: phim.ma_phim,
                tenPhim: phim.ten_phim,
                hinhAnh: phim.hinh_anh,
                hot: phim.hot,
                dangChieu: phim.dang_chieu,
                sapChieu: phim.sap_chieu,
                lstLichChieuTheoPhim: [],
              });
            }

            danhSachPhimMap.get(phim.ma_phim).lstLichChieuTheoPhim.push({
              maLichChieu: lichChieu.ma_lich_chieu,
              maRap: rap.ma_rap,
              tenRap: rap.ten_rap,
              ngayChieuGioChieu: lichChieu.ngay_gio_chieu,
              giaVe: lichChieu.gia_ve,
            });
          }
        }

        return {
          maCumRap: cumRap.ma_cum_rap,
          tenCumRap: cumRap.ten_cum_rap,
          diaChi: cumRap.dia_chi,
          danhSachPhim: Array.from(danhSachPhimMap.values()),
        };
      }),
    }));
  },

  // Lấy thông tin lịch chiếu phim theo mã phim Service
  async layThongTinLichChieuPhim(req) {
    const maPhim = (req.query.maPhim ?? req.query.ma_phim)?.trim();

    if (!maPhim) {
      throw new BadRequestError("Mã phim không được để trống");
    }

    const phim = await prisma.phim.findUnique({
      where: {
        ma_phim: maPhim,
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
        ma_nhom: true,

        LichChieu: {
          select: {
            ma_lich_chieu: true,
            ngay_gio_chieu: true,
            gia_ve: true,

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
              },
            },
          },
          orderBy: {
            ngay_gio_chieu: "asc",
          },
        },
      },
    });

    if (!phim) {
      throw new BadRequestError(`Không tìm thấy phim có mã ${maPhim}`);
    }

    const heThongRapMap = new Map();

    for (const lichChieu of phim.LichChieu) {
      const rapPhim = lichChieu.RapPhim;
      const cumRap = rapPhim.CumRap;
      const heThongRap = cumRap.HeThongRap;

      let heThongRapItem = heThongRapMap.get(heThongRap.ma_he_thong_rap);

      if (!heThongRapItem) {
        heThongRapItem = {
          maHeThongRap: heThongRap.ma_he_thong_rap,
          tenHeThongRap: heThongRap.ten_he_thong_rap,
          logo: heThongRap.logo,
          cumRapChieu: [],
          cumRapMap: new Map(),
        };

        heThongRapMap.set(heThongRap.ma_he_thong_rap, heThongRapItem);
      }

      let cumRapItem = heThongRapItem.cumRapMap.get(cumRap.ma_cum_rap);

      if (!cumRapItem) {
        cumRapItem = {
          maCumRap: cumRap.ma_cum_rap,
          tenCumRap: cumRap.ten_cum_rap,
          diaChi: cumRap.dia_chi,
          lichChieuPhim: [],
        };

        heThongRapItem.cumRapMap.set(cumRap.ma_cum_rap, cumRapItem);

        heThongRapItem.cumRapChieu.push(cumRapItem);
      }

      cumRapItem.lichChieuPhim.push({
        maLichChieu: lichChieu.ma_lich_chieu,
        maRap: rapPhim.ma_rap,
        tenRap: rapPhim.ten_rap,
        ngayChieuGioChieu: lichChieu.ngay_gio_chieu,
        giaVe: lichChieu.gia_ve,
      });
    }

    const heThongRapChieu = Array.from(heThongRapMap.values()).map(
      ({ cumRapMap, ...heThongRap }) => heThongRap,
    );

    return {
      maPhim: phim.ma_phim,
      tenPhim: phim.ten_phim,
      trailer: phim.trailer,
      hinhAnh: phim.hinh_anh,
      moTa: phim.mo_ta,
      ngayKhoiChieu: phim.ngay_khoi_chieu,
      danhGia: phim.danh_gia,
      hot: phim.hot,
      dangChieu: phim.dang_chieu,
      sapChieu: phim.sap_chieu,
      maNhom: phim.ma_nhom,
      heThongRapChieu,
    };
  },
};
