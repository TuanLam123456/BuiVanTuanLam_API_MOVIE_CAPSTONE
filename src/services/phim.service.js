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
  async layDanhSachPhimTheoNgay(req) {
    const {
      maNhom,
      tenPhim,
      tuNgay,
      denNgay,
      page = "1",
      pageSize = "10",
    } = req.query;

    if (!maNhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được phép để trống");
    }

    if (!tuNgay?.trim()) {
      throw new BadRequestError("Từ ngày không được phép để trống");
    }

    if (!denNgay?.trim()) {
      throw new BadRequestError("Đến ngày không được phép để trống");
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

    if (pageSizeNumber > 100) {
      throw new BadRequestError("PageSize không được lớn hơn 100");
    }

    const tuNgayValue = new Date(`${tuNgay.trim()}T00:00:00`);
    const denNgayValue = new Date(`${denNgay.trim()}T23:59:59.999`);

    if (Number.isNaN(tuNgayValue.getTime())) {
      throw new BadRequestError("Từ ngày không đúng định dạng YYYY-MM-DD");
    }

    if (Number.isNaN(denNgayValue.getTime())) {
      throw new BadRequestError("Đến ngày không đúng định dạng YYYY-MM-DD");
    }

    if (tuNgayValue > denNgayValue) {
      throw new BadRequestError("Từ ngày không được lớn hơn đến ngày");
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

      ngay_khoi_chieu: {
        gte: tuNgayValue,
        lte: denNgayValue,
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
          ngay_khoi_chieu: "asc",
        },
      }),

      prisma.phim.count({
        where: whereCondition,
      }),
    ]);

    return {
      currentPage: pageNumber,
      count: tongSoPhim,
      totalPages: Math.ceil(tongSoPhim / pageSizeNumber),
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

  // Thêm phim Upload Hình Service
  async themPhimUploadHinh(req) {
    const { frm } = req.body;

    if (!frm?.trim()) {
      throw new BadRequestError("Thông tin phim frm không được để trống");
    }

    if (!req.file) {
      throw new BadRequestError("Hình ảnh phim không được để trống");
    }

    let thongTinPhim;

    try {
      thongTinPhim = JSON.parse(frm);
    } catch {
      throw new BadRequestError("Dữ liệu frm phải là JSON hợp lệ");
    }

    const {
      maPhim,
      tenPhim,
      trailer,
      moTa,
      maNhom,
      ngayKhoiChieu,
      danhGia,
      hot,
      dangChieu,
      sapChieu,
    } = thongTinPhim;

    if (!tenPhim?.trim()) {
      throw new BadRequestError("Tên phim không được để trống");
    }

    if (!maNhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    if (!ngayKhoiChieu?.trim()) {
      throw new BadRequestError("Ngày khởi chiếu không được để trống");
    }

    const ngayKhoiChieuValue = new Date(ngayKhoiChieu);

    if (Number.isNaN(ngayKhoiChieuValue.getTime())) {
      throw new BadRequestError("Ngày khởi chiếu không hợp lệ");
    }

    const danhGiaValue = Number(danhGia);

    if (
      !Number.isInteger(danhGiaValue) ||
      danhGiaValue < 0 ||
      danhGiaValue > 10
    ) {
      throw new BadRequestError("Đánh giá phải là số nguyên từ 0 đến 10");
    }

    if (typeof hot !== "boolean") {
      throw new BadRequestError("Hot phải có giá trị true hoặc false");
    }

    if (typeof dangChieu !== "boolean") {
      throw new BadRequestError("Đang chiếu phải có giá trị true hoặc false");
    }

    if (typeof sapChieu !== "boolean") {
      throw new BadRequestError("Sắp chiếu phải có giá trị true hoặc false");
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

    if (maPhim !== undefined && maPhim !== null) {
      const maPhimValue = Number(maPhim);

      if (!Number.isInteger(maPhimValue) || maPhimValue < 1) {
        throw new BadRequestError("Mã phim phải là số nguyên lớn hơn 0");
      }

      const phimTonTai = await prisma.phim.findUnique({
        where: {
          ma_phim: maPhimValue,
        },
        select: {
          ma_phim: true,
        },
      });

      if (phimTonTai) {
        throw new BadRequestError(`Phim có mã ${maPhimValue} đã tồn tại`);
      }
    }

    const hinhAnh = `${req.protocol}://${req.get(
      "host",
    )}/images/${req.file.filename}`;

    const phimMoi = await prisma.phim.create({
      data: {
        ten_phim: tenPhim.trim(),
        trailer: trailer?.trim() || null,
        hinh_anh: hinhAnh,
        mo_ta: moTa?.trim() || "",
        ngay_khoi_chieu: ngayKhoiChieuValue,
        danh_gia: danhGiaValue,
        hot,
        dang_chieu: dangChieu,
        sap_chieu: sapChieu,

        Nhom: {
          connect: {
            ma_nhom: maNhom.trim(),
          },
        },
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

        Nhom: {
          select: {
            ma_nhom: true,
          },
        },
      },
    });

    return {
      maPhim: phimMoi.ma_phim,
      tenPhim: phimMoi.ten_phim,
      trailer: phimMoi.trailer,
      hinhAnh: phimMoi.hinh_anh,
      moTa: phimMoi.mo_ta,
      maNhom: phimMoi.Nhom.ma_nhom,
      ngayKhoiChieu: phimMoi.ngay_khoi_chieu,
      danhGia: phimMoi.danh_gia,
      hot: phimMoi.hot,
      dangChieu: phimMoi.dang_chieu,
      sapChieu: phimMoi.sap_chieu,
    };
  },

  // Lấy thông tin phim theo mã phim Service
  async layThongTinPhim(req) {
    const { maPhim } = req.params;

    const maPhimValue = Number(maPhim);

    if (!Number.isInteger(maPhimValue) || maPhimValue < 1) {
      throw new BadRequestError("Mã phim phải là số nguyên lớn hơn 0");
    }

    const phim = await prisma.phim.findUnique({
      where: {
        ma_phim: maPhimValue,
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

        Nhom: {
          select: {
            ma_nhom: true,
          },
        },
      },
    });

    if (!phim) {
      throw new BadRequestError(`Phim có mã ${maPhimValue} không tồn tại`);
    }

    return {
      maPhim: phim.ma_phim,
      tenPhim: phim.ten_phim,
      trailer: phim.trailer,
      hinhAnh: phim.hinh_anh,
      moTa: phim.mo_ta,
      maNhom: phim.Nhom.ma_nhom,
      ngayKhoiChieu: phim.ngay_khoi_chieu,
      danhGia: phim.danh_gia,
      hot: phim.hot,
      dangChieu: phim.dang_chieu,
      sapChieu: phim.sap_chieu,
    };
  },

  // Cập nhật phim Upload Hình Service
  async capNhatPhimUpload(req) {
    const { maPhim } = req.params;
    const { frm } = req.body;

    const maPhimValue = Number(maPhim);

    if (!Number.isInteger(maPhimValue) || maPhimValue < 1) {
      throw new BadRequestError("Mã phim phải là số nguyên lớn hơn 0");
    }

    if (!frm?.trim()) {
      throw new BadRequestError("Thông tin phim frm không được để trống");
    }

    let thongTinPhim;

    try {
      thongTinPhim = JSON.parse(frm);
    } catch {
      throw new BadRequestError("Dữ liệu frm phải là JSON hợp lệ");
    }

    const phimTonTai = await prisma.phim.findUnique({
      where: {
        ma_phim: maPhimValue,
      },

      select: {
        ma_phim: true,
        hinh_anh: true,
        ma_nhom: true,
      },
    });

    if (!phimTonTai) {
      throw new BadRequestError(`Phim có mã ${maPhimValue} không tồn tại`);
    }

    const {
      tenPhim,
      trailer,
      moTa,
      maNhom,
      ngayKhoiChieu,
      danhGia,
      hot,
      dangChieu,
      sapChieu,
    } = thongTinPhim;

    if (!tenPhim?.trim()) {
      throw new BadRequestError("Tên phim không được để trống");
    }

    if (!maNhom?.trim()) {
      throw new BadRequestError("Mã nhóm không được để trống");
    }

    if (!ngayKhoiChieu?.trim()) {
      throw new BadRequestError("Ngày khởi chiếu không được để trống");
    }

    const ngayKhoiChieuValue = new Date(ngayKhoiChieu);

    if (Number.isNaN(ngayKhoiChieuValue.getTime())) {
      throw new BadRequestError("Ngày khởi chiếu không hợp lệ");
    }

    const danhGiaValue = Number(danhGia);

    if (
      !Number.isInteger(danhGiaValue) ||
      danhGiaValue < 0 ||
      danhGiaValue > 10
    ) {
      throw new BadRequestError("Đánh giá phải là số nguyên từ 0 đến 10");
    }

    if (typeof hot !== "boolean") {
      throw new BadRequestError("Hot phải có giá trị true hoặc false");
    }

    if (typeof dangChieu !== "boolean") {
      throw new BadRequestError("Đang chiếu phải có giá trị true hoặc false");
    }

    if (typeof sapChieu !== "boolean") {
      throw new BadRequestError("Sắp chiếu phải có giá trị true hoặc false");
    }

    const maNhomValue = maNhom.trim();

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

    // Nếu có upload ảnh mới thì sử dụng ảnh mới.
    // Nếu không có thì giữ lại ảnh cũ.
    const hinhAnh = req.file
      ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      : phimTonTai.hinh_anh;

    const phimCapNhat = await prisma.phim.update({
      where: {
        ma_phim: maPhimValue,
      },

      data: {
        ten_phim: tenPhim.trim(),
        trailer: trailer?.trim() || null,
        hinh_anh: hinhAnh,
        mo_ta: moTa?.trim() || "",
        ngay_khoi_chieu: ngayKhoiChieuValue,
        danh_gia: danhGiaValue,
        hot,
        dang_chieu: dangChieu,
        sap_chieu: sapChieu,

        Nhom: {
          connect: {
            ma_nhom: maNhomValue,
          },
        },
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

        Nhom: {
          select: {
            ma_nhom: true,
          },
        },
      },
    });

    return {
      maPhim: phimCapNhat.ma_phim,
      tenPhim: phimCapNhat.ten_phim,
      trailer: phimCapNhat.trailer,
      hinhAnh: phimCapNhat.hinh_anh,
      moTa: phimCapNhat.mo_ta,
      maNhom: phimCapNhat.Nhom.ma_nhom,
      ngayKhoiChieu: phimCapNhat.ngay_khoi_chieu,
      danhGia: phimCapNhat.danh_gia,
      hot: phimCapNhat.hot,
      dangChieu: phimCapNhat.dang_chieu,
      sapChieu: phimCapNhat.sap_chieu,
    };
  },

  // Xóa phim Service
  async xoaPhim(req) {
    const { maPhim } = req.params;

    const maPhimValue = Number(maPhim);

    if (!Number.isInteger(maPhimValue) || maPhimValue < 1) {
      throw new BadRequestError("Mã phim phải là số nguyên lớn hơn 0");
    }

    const phimTonTai = await prisma.phim.findUnique({
      where: {
        ma_phim: maPhimValue,
      },

      select: {
        ma_phim: true,
        ten_phim: true,
      },
    });

    if (!phimTonTai) {
      throw new BadRequestError(`Phim có mã ${maPhimValue} không tồn tại`);
    }

    await prisma.phim.delete({
      where: {
        ma_phim: maPhimValue,
      },
    });

    return {
      maPhim: phimTonTai.ma_phim,
      tenPhim: phimTonTai.ten_phim,
    };
  },
};
