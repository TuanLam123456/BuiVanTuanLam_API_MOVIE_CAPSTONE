/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `Banner`;
CREATE TABLE `Banner` (
  `ma_banner` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ma_phim` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `hinh_anh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_banner`),
  KEY `idx_banner_ma_phim` (`ma_phim`),
  CONSTRAINT `fk_banner_phim` FOREIGN KEY (`ma_phim`) REFERENCES `Phim` (`ma_phim`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `CumRap`;
CREATE TABLE `CumRap` (
  `ma_cum_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ten_cum_rap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_he_thong_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`ma_cum_rap`),
  KEY `idx_cumrap_ma_he_thong_rap` (`ma_he_thong_rap`),
  CONSTRAINT `fk_cumrap_hethongrap` FOREIGN KEY (`ma_he_thong_rap`) REFERENCES `HeThongRap` (`ma_he_thong_rap`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `DatVe`;
CREATE TABLE `DatVe` (
  `ma_dat_ve` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `tai_khoan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_lich_chieu` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ma_ghe` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`ma_dat_ve`),
  UNIQUE KEY `unique_ghe_trong_lich_chieu` (`ma_lich_chieu`,`ma_ghe`),
  KEY `idx_datve_tai_khoan` (`tai_khoan`),
  KEY `idx_datve_ma_lich_chieu` (`ma_lich_chieu`),
  KEY `idx_datve_ma_ghe` (`ma_ghe`),
  CONSTRAINT `fk_datve_ghe` FOREIGN KEY (`ma_ghe`) REFERENCES `Ghe` (`ma_ghe`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_datve_lichchieu` FOREIGN KEY (`ma_lich_chieu`) REFERENCES `LichChieu` (`ma_lich_chieu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_datve_nguoidung` FOREIGN KEY (`tai_khoan`) REFERENCES `NguoiDung` (`tai_khoan`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `Ghe`;
CREATE TABLE `Ghe` (
  `ma_ghe` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ten_ghe` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_ghe` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`ma_ghe`),
  UNIQUE KEY `unique_ghe_trong_rap` (`ma_rap`,`ten_ghe`),
  KEY `idx_ghe_ma_rap` (`ma_rap`),
  CONSTRAINT `fk_ghe_rapphim` FOREIGN KEY (`ma_rap`) REFERENCES `RapPhim` (`ma_rap`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `HeThongRap`;
CREATE TABLE `HeThongRap` (
  `ma_he_thong_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ten_he_thong_rap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_he_thong_rap`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `LichChieu`;
CREATE TABLE `LichChieu` (
  `ma_lich_chieu` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ma_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ma_phim` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ngay_gio_chieu` datetime NOT NULL,
  `gia_ve` int NOT NULL,
  PRIMARY KEY (`ma_lich_chieu`),
  KEY `idx_lichchieu_ma_phim` (`ma_phim`),
  KEY `idx_lichchieu_ma_rap` (`ma_rap`),
  KEY `idx_lichchieu_ngay_gio_chieu` (`ngay_gio_chieu`),
  CONSTRAINT `fk_lichchieu_phim` FOREIGN KEY (`ma_phim`) REFERENCES `Phim` (`ma_phim`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lichchieu_rapphim` FOREIGN KEY (`ma_rap`) REFERENCES `RapPhim` (`ma_rap`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `LoaiNguoiDung`;
CREATE TABLE `LoaiNguoiDung` (
  `ma_loai_nguoi_dung` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_loai_nguoi_dung` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_loai_nguoi_dung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `NguoiDung`;
CREATE TABLE `NguoiDung` (
  `tai_khoan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ho_ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dt` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_nguoi_dung` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nhom` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GP01',
  PRIMARY KEY (`tai_khoan`),
  UNIQUE KEY `unique_nguoidung_email` (`email`),
  KEY `idx_nguoidung_ma_nhom` (`ma_nhom`),
  KEY `idx_nguoidung_loai_nguoi_dung` (`loai_nguoi_dung`),
  CONSTRAINT `fk_nguoidung_loainguoidung` FOREIGN KEY (`loai_nguoi_dung`) REFERENCES `LoaiNguoiDung` (`ma_loai_nguoi_dung`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_nguoidung_nhom` FOREIGN KEY (`ma_nhom`) REFERENCES `Nhom` (`ma_nhom`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `Nhom`;
CREATE TABLE `Nhom` (
  `ma_nhom` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_nhom` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_nhom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `Phim`;
CREATE TABLE `Phim` (
  `ma_phim` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ten_phim` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trailer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hinh_anh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `ngay_khoi_chieu` date DEFAULT NULL,
  `danh_gia` int DEFAULT NULL,
  `hot` tinyint(1) DEFAULT '0',
  `dang_chieu` tinyint(1) DEFAULT '0',
  `sap_chieu` tinyint(1) DEFAULT '0',
  `ma_nhom` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GP01',
  PRIMARY KEY (`ma_phim`),
  KEY `idx_phim_ma_nhom` (`ma_nhom`),
  CONSTRAINT `fk_phim_nhom` FOREIGN KEY (`ma_nhom`) REFERENCES `Nhom` (`ma_nhom`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `RapPhim`;
CREATE TABLE `RapPhim` (
  `ma_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ten_rap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_cum_rap` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`ma_rap`),
  KEY `idx_rapphim_ma_cum_rap` (`ma_cum_rap`),
  CONSTRAINT `fk_rapphim_cumrap` FOREIGN KEY (`ma_cum_rap`) REFERENCES `CumRap` (`ma_cum_rap`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Banner` (`ma_banner`, `ma_phim`, `hinh_anh`) VALUES
('BN_AVATAR_3', 'PHIM_AVATAR_3', 'https://example.com/banners/avatar-3.jpg'),
('BN_AVENGERS', 'PHIM_AVENGERS', 'https://example.com/banners/avengers.jpg'),
('BN_DUNE_2', 'PHIM_DUNE_2', 'https://example.com/banners/dune-2.jpg'),
('BN_INSIDE_OUT_2', 'PHIM_INSIDE_OUT_2', 'https://example.com/banners/inside-out-2.jpg'),
('BN_INTERSTELLAR', 'PHIM_INTERSTELLAR', 'https://example.com/banners/interstellar.jpg'),
('BN_MAI', 'PHIM_MAI', 'https://example.com/banners/mai.jpg');
INSERT INTO `CumRap` (`ma_cum_rap`, `ten_cum_rap`, `dia_chi`, `ma_he_thong_rap`) VALUES
('CUM_CGV_BINHTAN', 'CGV Aeon Bình Tân', '1 Đường số 17A, TP. Hồ Chí Minh', 'HTR_CGV'),
('CUM_CGV_DONGKHOI', 'CGV Vincom Đồng Khởi', '72 Lê Thánh Tôn, TP. Hồ Chí Minh', 'HTR_CGV'),
('CUM_GALAXY_NGUYENDU', 'Galaxy Nguyễn Du', '116 Nguyễn Du, TP. Hồ Chí Minh', 'HTR_GALAXY'),
('CUM_LOTTE_NAMSG', 'Lotte Cinema Nam Sài Gòn', '469 Nguyễn Hữu Thọ, TP. Hồ Chí Minh', 'HTR_LOTTE');
INSERT INTO `DatVe` (`ma_dat_ve`, `tai_khoan`, `ma_lich_chieu`, `ma_ghe`) VALUES
('DV_HOANGNAM_001', 'hoang_nam', 'LC_INSIDEOUT_DK_02', 'GHE_CGV_DK_02_B01'),
('DV_LAM_001', 'dantethegodslayer2000', 'LC_AVENGERS_DK_01', 'GHE_CGV_DK_01_B01'),
('DV_LAM_002', 'dantethegodslayer2000', 'LC_AVENGERS_DK_01', 'GHE_CGV_DK_01_B02'),
('DV_MINHANH_001', 'minh_anh', 'LC_DUNE2_DK_01', 'GHE_CGV_DK_01_A01'),
('DV_QUANGHUY_001', 'quang_huy', 'LC_INTERSTELLAR_BT_01', 'GHE_CGV_BT_01_A01'),
('DV_THANHTHUY_001', 'thanh_thuy', 'LC_INSIDEOUT_DK_02', 'GHE_CGV_DK_02_B02');
INSERT INTO `Ghe` (`ma_ghe`, `ten_ghe`, `loai_ghe`, `ma_rap`) VALUES
('GHE_CGV_BT_01_A01', 'A01', 'THUONG', 'RAP_CGV_BT_01'),
('GHE_CGV_BT_01_A02', 'A02', 'THUONG', 'RAP_CGV_BT_01'),
('GHE_CGV_BT_01_B01', 'B01', 'VIP', 'RAP_CGV_BT_01'),
('GHE_CGV_BT_01_B02', 'B02', 'VIP', 'RAP_CGV_BT_01'),
('GHE_CGV_DK_01_A01', 'A01', 'THUONG', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_01_A02', 'A02', 'THUONG', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_01_A03', 'A03', 'THUONG', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_01_A04', 'A04', 'THUONG', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_01_B01', 'B01', 'VIP', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_01_B02', 'B02', 'VIP', 'RAP_CGV_DK_01'),
('GHE_CGV_DK_02_A01', 'A01', 'THUONG', 'RAP_CGV_DK_02'),
('GHE_CGV_DK_02_A02', 'A02', 'THUONG', 'RAP_CGV_DK_02'),
('GHE_CGV_DK_02_A03', 'A03', 'THUONG', 'RAP_CGV_DK_02'),
('GHE_CGV_DK_02_A04', 'A04', 'THUONG', 'RAP_CGV_DK_02'),
('GHE_CGV_DK_02_B01', 'B01', 'VIP', 'RAP_CGV_DK_02'),
('GHE_CGV_DK_02_B02', 'B02', 'VIP', 'RAP_CGV_DK_02'),
('GHE_GALAXY_ND_01_A01', 'A01', 'THUONG', 'RAP_GALAXY_ND_01'),
('GHE_GALAXY_ND_01_A02', 'A02', 'THUONG', 'RAP_GALAXY_ND_01'),
('GHE_GALAXY_ND_01_B01', 'B01', 'VIP', 'RAP_GALAXY_ND_01'),
('GHE_GALAXY_ND_01_B02', 'B02', 'VIP', 'RAP_GALAXY_ND_01'),
('GHE_LOTTE_NS_01_A01', 'A01', 'THUONG', 'RAP_LOTTE_NS_01'),
('GHE_LOTTE_NS_01_A02', 'A02', 'THUONG', 'RAP_LOTTE_NS_01'),
('GHE_LOTTE_NS_01_B01', 'B01', 'VIP', 'RAP_LOTTE_NS_01'),
('GHE_LOTTE_NS_01_B02', 'B02', 'VIP', 'RAP_LOTTE_NS_01');
INSERT INTO `HeThongRap` (`ma_he_thong_rap`, `ten_he_thong_rap`, `logo`) VALUES
('HTR_CGV', 'CGV Cinemas', 'https://example.com/logos/cgv.png'),
('HTR_GALAXY', 'Galaxy Cinema', 'https://example.com/logos/galaxy.png'),
('HTR_LOTTE', 'Lotte Cinema', 'https://example.com/logos/lotte.png');
INSERT INTO `LichChieu` (`ma_lich_chieu`, `ma_rap`, `ma_phim`, `ngay_gio_chieu`, `gia_ve`) VALUES
('LC_AVENGERS_DK_01', 'RAP_CGV_DK_01', 'PHIM_AVENGERS', '2026-07-20 18:30:00', 120000),
('LC_DUNE2_BT_01', 'RAP_CGV_BT_01', 'PHIM_DUNE_2', '2026-07-23 20:30:00', 170000),
('LC_DUNE2_DK_01', 'RAP_CGV_DK_01', 'PHIM_DUNE_2', '2026-07-20 21:30:00', 140000),
('LC_GODZILLA_DK_02', 'RAP_CGV_DK_02', 'PHIM_GODZILLA_KONG', '2026-07-23 15:15:00', 85000),
('LC_INSIDEOUT_DK_02', 'RAP_CGV_DK_02', 'PHIM_INSIDE_OUT_2', '2026-07-21 10:00:00', 75000),
('LC_INSIDEOUT_GALAXY', 'RAP_GALAXY_ND_01', 'PHIM_INSIDE_OUT_2', '2026-07-24 09:30:00', 70000),
('LC_INTERSTELLAR_BT_01', 'RAP_CGV_BT_01', 'PHIM_INTERSTELLAR', '2026-07-21 19:00:00', 180000),
('LC_LATMAT7_LOTTE_02', 'RAP_LOTTE_NS_02', 'PHIM_LAT_MAT_7', '2026-07-22 17:45:00', 90000),
('LC_MAI_LOTTE_01', 'RAP_LOTTE_NS_01', 'PHIM_MAI', '2026-07-22 20:00:00', 95000);
INSERT INTO `LoaiNguoiDung` (`ma_loai_nguoi_dung`, `ten_loai_nguoi_dung`) VALUES
('KHACH_HANG', 'Khách hàng'),
('QUAN_TRI', 'Quản trị');
INSERT INTO `NguoiDung` (`tai_khoan`, `ho_ten`, `email`, `so_dt`, `mat_khau`, `loai_nguoi_dung`, `ma_nhom`) VALUES
('admin_cinema', 'Nguyễn Quốc Bảo', 'admin@example.com', '0922333444', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'QUAN_TRI', 'GP01'),
('dantethegodslayer2000', 'Bùi Văn Tuấn Lâm', 'dantethegodslayer2000@gmail.com', '0367797348', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'QUAN_TRI', 'GP01'),
('hoang_nam', 'Trần Hoàng Nam', 'hoangnam@example.com', '0912345678', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP01'),
('minh_anh', 'Nguyễn Minh Anh', 'minhanh@example.com', '0901234567', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP01'),
('quang_huy', 'Phạm Quang Huy', 'quanghuy@example.com', '0935123456', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP02'),
('thanh_thuy', 'Lê Thị Thanh Thúy', 'thanhthuy@example.com', '0987654321', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP01'),
('thu_ha', 'Võ Thu Hà', 'thuha@example.com', '0978123456', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP02'),
('TL', 'TL2', 'lam@gmail.com', '0367797348', '$2b$10$Dxs.oB.Hi1Cd1h.fOdzDve6bUSWr6rAq/wYOJKTaalkTmOJ0FAA42', 'KHACH_HANG', 'GP02');
INSERT INTO `Nhom` (`ma_nhom`, `ten_nhom`) VALUES
('GP01', 'Nhóm chính'),
('GP02', 'Nhóm mở rộng');
INSERT INTO `Phim` (`ma_phim`, `ten_phim`, `trailer`, `hinh_anh`, `mo_ta`, `ngay_khoi_chieu`, `danh_gia`, `hot`, `dang_chieu`, `sap_chieu`, `ma_nhom`) VALUES
('PHIM_AVATAR_3', 'Avatar 3', 'https://example.com/trailers/avatar-3', 'https://example.com/images/avatar-3.jpg', 'Hành trình mới trên Pandora với những vùng đất và bộ tộc mới.', '2026-12-18', NULL, 1, 0, 1, 'GP01'),
('PHIM_AVENGERS', 'Avengers: Endgame', 'https://example.com/trailers/avengers', 'https://example.com/images/avengers.jpg', 'Các siêu anh hùng tập hợp để đảo ngược hậu quả do Thanos gây ra.', '2019-04-26', 10, 1, 1, 0, 'GP01'),
('PHIM_CONJURING', 'The Conjuring', 'https://example.com/trailers/conjuring', 'https://example.com/images/conjuring.jpg', 'Một gia đình đối mặt với thế lực siêu nhiên trong ngôi nhà mới.', '2013-07-19', 8, 0, 0, 0, 'GP02'),
('PHIM_DUNE_2', 'Dune: Part Two', 'https://example.com/trailers/dune-2', 'https://example.com/images/dune-2.jpg', 'Paul Atreides liên minh với người Fremen để chiến đấu vì Arrakis.', '2024-03-01', 9, 1, 1, 0, 'GP01'),
('PHIM_GODZILLA_KONG', 'Godzilla x Kong', 'https://example.com/trailers/godzilla-kong', 'https://example.com/images/godzilla-kong.jpg', 'Godzilla và Kong hợp sức chống lại một mối đe dọa mới.', '2024-03-29', 8, 0, 1, 0, 'GP01'),
('PHIM_INSIDE_OUT_2', 'Inside Out 2', 'https://example.com/trailers/inside-out-2', 'https://example.com/images/inside-out-2.jpg', 'Riley bước vào tuổi thiếu niên và gặp những cảm xúc mới.', '2024-06-14', 9, 1, 1, 0, 'GP01'),
('PHIM_INTERSTELLAR', 'Interstellar', 'https://example.com/trailers/interstellar', 'https://example.com/images/interstellar.jpg', 'Một nhóm phi hành gia tìm kiếm nơi ở mới cho nhân loại.', '2014-11-07', 10, 1, 1, 0, 'GP01'),
('PHIM_LAT_MAT_7', 'Lật Mặt 7: Một Điều Ước', 'https://example.com/trailers/lat-mat-7', 'https://example.com/images/lat-mat-7.jpg', 'Câu chuyện gia đình về tình mẫu tử và sự hy sinh.', '2024-04-26', 8, 1, 1, 0, 'GP01'),
('PHIM_MAI', 'Mai', 'https://example.com/trailers/mai', 'https://example.com/images/mai.jpg', 'Câu chuyện về một người phụ nữ đi tìm cơ hội chữa lành.', '2024-02-10', 8, 1, 1, 0, 'GP01'),
('PHIM_PARASITE', 'Parasite', 'https://example.com/trailers/parasite', 'https://example.com/images/parasite.jpg', 'Một gia đình nghèo thâm nhập vào cuộc sống của gia đình giàu có.', '2019-05-30', 9, 0, 0, 0, 'GP02'),
('PHIM_THAM_TU_KIEN', 'Thám Tử Kiên', 'https://example.com/trailers/tham-tu-kien', 'https://example.com/images/tham-tu-kien.jpg', 'Một thám tử điều tra vụ án liên quan đến nhiều bí mật bị che giấu.', '2026-08-28', NULL, 0, 0, 1, 'GP02'),
('PHIM_YOUR_NAME', 'Your Name', 'https://example.com/trailers/your-name', 'https://example.com/images/your-name.jpg', 'Hai học sinh xa lạ tạo nên một mối liên kết vượt thời gian.', '2016-08-26', 9, 0, 0, 0, 'GP02');
INSERT INTO `RapPhim` (`ma_rap`, `ten_rap`, `ma_cum_rap`) VALUES
('RAP_CGV_BT_01', 'Rạp 01 - Gold Class', 'CUM_CGV_BINHTAN'),
('RAP_CGV_DK_01', 'Rạp 01 - IMAX', 'CUM_CGV_DONGKHOI'),
('RAP_CGV_DK_02', 'Rạp 02 - Standard', 'CUM_CGV_DONGKHOI'),
('RAP_GALAXY_ND_01', 'Rạp 01', 'CUM_GALAXY_NGUYENDU'),
('RAP_LOTTE_NS_01', 'Rạp 01 - Superplex', 'CUM_LOTTE_NAMSG'),
('RAP_LOTTE_NS_02', 'Rạp 02 - Standard', 'CUM_LOTTE_NAMSG');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;