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

  // Lấy thông tin lịch chiếu hệ thống rạp Service
  async layThongTinLichChieuHeThongRap(req) {
    const { ma_nhom, maHeThongRap } = req.query;

    // ma_nhom bắt buộc
    if (!ma_nhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    const maNhom = ma_nhom.trim();

    // Kiểm tra nhóm có tồn tại hay không
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

    let maHeThongRapNumber;

    // maHeThongRap không bắt buộc, nhưng nếu truyền thì phải hợp lệ
    if (maHeThongRap !== undefined && maHeThongRap !== "") {
      maHeThongRapNumber = Number(maHeThongRap);

      if (!Number.isInteger(maHeThongRapNumber) || maHeThongRapNumber < 1) {
        throw new BadRequestError(
          "Mã hệ thống rạp phải là số nguyên lớn hơn 0",
        );
      }

      const heThongRapExists = await prisma.heThongRap.findUnique({
        where: {
          ma_he_thong_rap: maHeThongRapNumber,
        },
        select: {
          ma_he_thong_rap: true,
        },
      });

      if (!heThongRapExists) {
        throw new BadRequestError(
          `Không tìm thấy hệ thống rạp có mã ${maHeThongRapNumber}`,
        );
      }
    }

    const danhSachHeThongRap = await prisma.heThongRap.findMany({
      where: {
        /*
         * Nếu client có truyền maHeThongRap:
         * - Chỉ lấy đúng hệ thống rạp có mã tương ứng.
         *
         * Nếu client không truyền maHeThongRap:
         * - Không thêm điều kiện ma_he_thong_rap vào câu truy vấn.
         * - Khi đó Prisma sẽ lấy tất cả hệ thống rạp thỏa điều kiện phía dưới.
         */
        ...(maHeThongRapNumber && {
          ma_he_thong_rap: maHeThongRapNumber,
        }),

        /*
         * Chỉ lấy những hệ thống rạp có ít nhất một lịch chiếu
         * của phim thuộc mã nhóm đang tìm.
         *
         * Quan hệ được duyệt theo thứ tự:
         *
         * HeThongRap
         *   -> CumRap
         *     -> RapPhim
         *       -> LichChieu
         *         -> Phim
         *
         * `some` nghĩa là:
         * - Có ít nhất một bản ghi con thỏa điều kiện.
         *
         * Cụ thể:
         * - Hệ thống rạp phải có ít nhất một cụm rạp.
         * - Cụm rạp đó phải có ít nhất một rạp phim.
         * - Rạp phim đó phải có ít nhất một lịch chiếu.
         * - Lịch chiếu đó phải thuộc phim có ma_nhom = maNhom.
         */
        CumRap: {
          some: {
            RapPhim: {
              some: {
                LichChieu: {
                  some: {
                    Phim: {
                      ma_nhom: maNhom,
                    },
                  },
                },
              },
            },
          },
        },
      },

      select: {
        /*
         * Chỉ lấy các trường cần thiết của hệ thống rạp.
         * Không lấy toàn bộ cột trong bảng HeThongRap.
         */
        ma_he_thong_rap: true,
        ten_he_thong_rap: true,
        logo: true,

        /*
         * Lấy danh sách cụm rạp thuộc từng hệ thống rạp.
         */
        CumRap: {
          where: {
            /*
             * Chỉ lấy những cụm rạp có ít nhất một rạp phim
             * đang có lịch chiếu của phim thuộc maNhom.
             *
             * Điều kiện này giúp loại bỏ các cụm rạp không có
             * dữ liệu lịch chiếu phù hợp.
             */
            RapPhim: {
              some: {
                LichChieu: {
                  some: {
                    Phim: {
                      ma_nhom: maNhom,
                    },
                  },
                },
              },
            },
          },

          select: {
            /*
             * Thông tin cơ bản của cụm rạp.
             */
            ma_cum_rap: true,
            ten_cum_rap: true,
            dia_chi: true,

            /*
             * Lấy danh sách rạp phim nằm trong từng cụm rạp.
             */
            RapPhim: {
              where: {
                /*
                 * Chỉ lấy những rạp có ít nhất một lịch chiếu
                 * của phim thuộc nhóm maNhom.
                 *
                 * Nhờ điều kiện này, các rạp không có lịch chiếu
                 * phù hợp sẽ không xuất hiện trong kết quả.
                 */
                LichChieu: {
                  some: {
                    Phim: {
                      ma_nhom: maNhom,
                    },
                  },
                },
              },

              select: {
                /*
                 * Thông tin cơ bản của rạp.
                 */
                ma_rap: true,
                ten_rap: true,

                /*
                 * Lấy danh sách lịch chiếu trong từng rạp.
                 */
                LichChieu: {
                  where: {
                    /*
                     * Chỉ lấy lịch chiếu của những phim
                     * có ma_nhom đúng với mã nhóm client truyền lên.
                     */
                    Phim: {
                      ma_nhom: maNhom,
                    },
                  },

                  select: {
                    /*
                     * Thông tin của từng lịch chiếu.
                     */
                    ma_lich_chieu: true,
                    ma_rap: true,
                    ma_phim: true,
                    ngay_gio_chieu: true,
                    gia_ve: true,

                    /*
                     * Lấy thêm thông tin phim gắn với lịch chiếu.
                     *
                     * Không lấy toàn bộ dữ liệu phim, chỉ lấy các trường
                     * cần dùng để hiển thị lịch chiếu ngoài frontend.
                     */
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

                  /*
                   * Sắp xếp lịch chiếu theo thời gian tăng dần.
                   *
                   * Lịch chiếu sớm nhất sẽ nằm trước,
                   * lịch chiếu muộn hơn sẽ nằm sau.
                   */
                  orderBy: {
                    ngay_gio_chieu: "asc",
                  },
                },
              },

              /*
               * Sắp xếp danh sách rạp theo mã rạp tăng dần.
               */
              orderBy: {
                ma_rap: "asc",
              },
            },
          },

          /*
           * Sắp xếp danh sách cụm rạp theo mã cụm rạp tăng dần.
           */
          orderBy: {
            ma_cum_rap: "asc",
          },
        },
      },

      /*
       * Sắp xếp danh sách hệ thống rạp theo mã hệ thống tăng dần.
       */
      orderBy: {
        ma_he_thong_rap: "asc",
      },
    });

    return danhSachHeThongRap.map((heThongRap) => ({
      maHeThongRap: heThongRap.ma_he_thong_rap,
      tenHeThongRap: heThongRap.ten_he_thong_rap,
      logo: heThongRap.logo,

      lstCumRap: heThongRap.CumRap.map((cumRap) => {
        /*
         * Các lịch chiếu đang nằm trong từng rạp.
         * Gom chúng lại theo phim để trả về cấu trúc dễ dùng cho frontend.
         */
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
    const { maPhim } = req.query;

    // Kiểm tra mã phim có được truyền lên hay không
    if (!maPhim?.trim()) {
      throw new BadRequestError("Mã phim không được để trống");
    }

    const maPhimNumber = Number(maPhim);

    // Kiểm tra mã phim có phải số nguyên dương hay không
    if (!Number.isInteger(maPhimNumber) || maPhimNumber < 1) {
      throw new BadRequestError("Mã phim phải là số nguyên lớn hơn 0");
    }

    /*
     * Tìm phim theo mã phim.
     *
     * Đồng thời lấy toàn bộ lịch chiếu của phim theo quan hệ:
     *
     * Phim
     *   -> LichChieu
     *     -> RapPhim
     *       -> CumRap
     *         -> HeThongRap
     */
    const phim = await prisma.phim.findUnique({
      where: {
        ma_phim: maPhimNumber,
      },

      select: {
        // Thông tin phim
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

        // Danh sách lịch chiếu của phim
        LichChieu: {
          select: {
            ma_lich_chieu: true,
            ngay_gio_chieu: true,
            gia_ve: true,

            // Rạp đang chiếu phim
            RapPhim: {
              select: {
                ma_rap: true,
                ten_rap: true,

                // Cụm rạp chứa rạp phim
                CumRap: {
                  select: {
                    ma_cum_rap: true,
                    ten_cum_rap: true,
                    dia_chi: true,

                    // Hệ thống rạp chứa cụm rạp
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

          // Lịch chiếu gần nhất nằm trước
          orderBy: {
            ngay_gio_chieu: "asc",
          },
        },
      },
    });

    if (!phim) {
      throw new BadRequestError(`Không tìm thấy phim có mã ${maPhimNumber}`);
    }

    /*
     * Gom dữ liệu lịch chiếu theo cấu trúc:
     *
     * Hệ thống rạp
     *   -> Cụm rạp
     *     -> Lịch chiếu
     */
    const heThongRapMap = new Map();

    for (const lichChieu of phim.LichChieu) {
      const rapPhim = lichChieu.RapPhim;
      const cumRap = rapPhim.CumRap;
      const heThongRap = cumRap.HeThongRap;

      // Nếu hệ thống rạp chưa tồn tại trong Map thì tạo mới
      if (!heThongRapMap.has(heThongRap.ma_he_thong_rap)) {
        heThongRapMap.set(heThongRap.ma_he_thong_rap, {
          maHeThongRap: heThongRap.ma_he_thong_rap,
          tenHeThongRap: heThongRap.ten_he_thong_rap,
          logo: heThongRap.logo,
          cumRapChieu: [],
        });
      }

      const heThongRapItem = heThongRapMap.get(heThongRap.ma_he_thong_rap);

      // Tìm cụm rạp đã được thêm vào hệ thống hay chưa
      let cumRapItem = heThongRapItem.cumRapChieu.find(
        (item) => item.maCumRap === cumRap.ma_cum_rap,
      );

      // Nếu cụm rạp chưa tồn tại thì tạo mới
      if (!cumRapItem) {
        cumRapItem = {
          maCumRap: cumRap.ma_cum_rap,
          tenCumRap: cumRap.ten_cum_rap,
          diaChi: cumRap.dia_chi,
          lichChieuPhim: [],
        };

        heThongRapItem.cumRapChieu.push(cumRapItem);
      }

      // Thêm lịch chiếu vào cụm rạp tương ứng
      cumRapItem.lichChieuPhim.push({
        maLichChieu: lichChieu.ma_lich_chieu,
        maRap: rapPhim.ma_rap,
        tenRap: rapPhim.ten_rap,
        ngayChieuGioChieu: lichChieu.ngay_gio_chieu,
        giaVe: lichChieu.gia_ve,
      });
    }

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
      heThongRapChieu: Array.from(heThongRapMap.values()),
    };
  },
};
