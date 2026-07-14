CREATE DATABASE IF NOT EXISTS api_movie
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE api_movie;

-- =========================
-- Bảng Phim
-- =========================
CREATE TABLE Phim (
    ma_phim INT AUTO_INCREMENT PRIMARY KEY,
    ten_phim VARCHAR(255) NOT NULL,
    trailer VARCHAR(255),
    hinh_anh VARCHAR(255),
    mo_ta TEXT,
    ngay_khoi_chieu DATE,
    danh_gia INT,
    hot BOOLEAN DEFAULT FALSE,
    dang_chieu BOOLEAN DEFAULT FALSE,
    sap_chieu BOOLEAN DEFAULT FALSE
);

-- =========================
-- Bảng Banner
-- =========================
CREATE TABLE Banner (
    ma_banner INT AUTO_INCREMENT PRIMARY KEY,
    ma_phim INT NOT NULL,
    hinh_anh VARCHAR(255),

    CONSTRAINT fk_banner_phim
        FOREIGN KEY (ma_phim)
        REFERENCES Phim(ma_phim)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- Bảng Hệ Thống Rạp
-- =========================
CREATE TABLE HeThongRap (
    ma_he_thong_rap INT AUTO_INCREMENT PRIMARY KEY,
    ten_he_thong_rap VARCHAR(255) NOT NULL,
    logo VARCHAR(255)
);

-- =========================
-- Bảng Cụm Rạp
-- =========================
CREATE TABLE CumRap (
    ma_cum_rap INT AUTO_INCREMENT PRIMARY KEY,
    ten_cum_rap VARCHAR(255) NOT NULL,
    dia_chi VARCHAR(255),
    ma_he_thong_rap INT NOT NULL,

    CONSTRAINT fk_cumrap_hethongrap
        FOREIGN KEY (ma_he_thong_rap)
        REFERENCES HeThongRap(ma_he_thong_rap)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- Bảng Rạp Phim
-- =========================
CREATE TABLE RapPhim (
    ma_rap INT AUTO_INCREMENT PRIMARY KEY,
    ten_rap VARCHAR(255) NOT NULL,
    ma_cum_rap INT NOT NULL,

    CONSTRAINT fk_rapphim_cumrap
        FOREIGN KEY (ma_cum_rap)
        REFERENCES CumRap(ma_cum_rap)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- Bảng Ghế
-- =========================
CREATE TABLE Ghe (
    ma_ghe INT AUTO_INCREMENT PRIMARY KEY,
    ten_ghe VARCHAR(100) NOT NULL,
    loai_ghe VARCHAR(100),
    ma_rap INT NOT NULL,

    CONSTRAINT fk_ghe_rapphim
        FOREIGN KEY (ma_rap)
        REFERENCES RapPhim(ma_rap)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- Bảng Người Dùng
-- =========================
CREATE TABLE NguoiDung (
    tai_khoan INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    so_dt VARCHAR(20),
    mat_khau VARCHAR(255) NOT NULL,
    loai_nguoi_dung VARCHAR(100)
);

-- =========================
-- Bảng Lịch Chiếu
-- =========================
CREATE TABLE LichChieu (
    ma_lich_chieu INT AUTO_INCREMENT PRIMARY KEY,
    ma_rap INT NOT NULL,
    ma_phim INT NOT NULL,
    ngay_gio_chieu DATETIME NOT NULL,
    gia_ve INT NOT NULL,

    CONSTRAINT fk_lichchieu_rapphim
        FOREIGN KEY (ma_rap)
        REFERENCES RapPhim(ma_rap)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_lichchieu_phim
        FOREIGN KEY (ma_phim)
        REFERENCES Phim(ma_phim)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- =========================
-- Bảng Đặt Vé
-- =========================
CREATE TABLE DatVe (
    ma_dat_ve INT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan INT NOT NULL,
    ma_lich_chieu INT NOT NULL,
    ma_ghe INT NOT NULL,

    CONSTRAINT fk_datve_nguoidung
        FOREIGN KEY (tai_khoan)
        REFERENCES NguoiDung(tai_khoan)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_datve_lichchieu
        FOREIGN KEY (ma_lich_chieu)
        REFERENCES LichChieu(ma_lich_chieu)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_datve_ghe
        FOREIGN KEY (ma_ghe)
        REFERENCES Ghe(ma_ghe)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT unique_ghe_trong_lich_chieu
        UNIQUE (ma_lich_chieu, ma_ghe)
);

-- =====================================================
-- 1. DỮ LIỆU PHIM
-- =====================================================
INSERT INTO Phim
    (ten_phim, trailer, hinh_anh, mo_ta, ngay_khoi_chieu, danh_gia, hot, dang_chieu, sap_chieu)
VALUES
(
    'Avengers: Endgame',
    'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    'https://example.com/images/avengers-endgame.jpg',
    'Các siêu anh hùng còn sống sót tập hợp để đảo ngược hậu quả do Thanos gây ra.',
    '2026-06-01',
    10,
    TRUE,
    TRUE,
    FALSE
),
(
    'Spider-Man: No Way Home',
    'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    'https://example.com/images/spiderman-no-way-home.jpg',
    'Danh tính của Peter Parker bị tiết lộ, khiến cuộc sống của anh bị đảo lộn.',
    '2026-06-05',
    9,
    TRUE,
    TRUE,
    FALSE
),
(
    'The Batman',
    'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    'https://example.com/images/the-batman.jpg',
    'Batman điều tra một loạt vụ án bí ẩn tại thành phố Gotham.',
    '2026-06-10',
    9,
    TRUE,
    TRUE,
    FALSE
),
(
    'Dune: Part Two',
    'https://www.youtube.com/watch?v=Way9Dexny3w',
    'https://example.com/images/dune-part-two.jpg',
    'Paul Atreides hợp lực với Chani và người Fremen để trả thù cho gia đình.',
    '2026-06-15',
    9,
    TRUE,
    TRUE,
    FALSE
),
(
    'Inside Out 2',
    'https://www.youtube.com/watch?v=LEjhY15eCx0',
    'https://example.com/images/inside-out-2.jpg',
    'Riley bước vào tuổi thiếu niên và phải đối mặt với những cảm xúc mới.',
    '2026-06-20',
    8,
    FALSE,
    TRUE,
    FALSE
),
(
    'Kung Fu Panda 4',
    'https://www.youtube.com/watch?v=_inKs4eeHiI',
    'https://example.com/images/kung-fu-panda-4.jpg',
    'Po chuẩn bị trở thành thủ lĩnh tinh thần của Thung lũng Bình Yên.',
    '2026-06-25',
    8,
    FALSE,
    TRUE,
    FALSE
),
(
    'Deadpool & Wolverine',
    'https://www.youtube.com/watch?v=73_1biulkYk',
    'https://example.com/images/deadpool-wolverine.jpg',
    'Deadpool và Wolverine cùng tham gia một nhiệm vụ xuyên đa vũ trụ.',
    '2026-07-20',
    9,
    TRUE,
    FALSE,
    TRUE
),
(
    'Avatar 3',
    'https://www.youtube.com/watch?v=avatar3',
    'https://example.com/images/avatar-3.jpg',
    'Cuộc phiêu lưu mới trên hành tinh Pandora tiếp tục với gia đình Sully.',
    '2026-08-15',
    8,
    TRUE,
    FALSE,
    TRUE
),
(
    'Mission: Impossible 8',
    'https://www.youtube.com/watch?v=mission-impossible-8',
    'https://example.com/images/mission-impossible-8.jpg',
    'Ethan Hunt thực hiện nhiệm vụ nguy hiểm nhất trong sự nghiệp.',
    '2026-09-05',
    8,
    FALSE,
    FALSE,
    TRUE
),
(
    'Minecraft Movie',
    'https://www.youtube.com/watch?v=minecraft-movie',
    'https://example.com/images/minecraft-movie.jpg',
    'Một nhóm nhân vật khám phá thế giới Minecraft kỳ thú.',
    '2026-10-10',
    7,
    FALSE,
    FALSE,
    TRUE
);

-- =====================================================
-- 2. DỮ LIỆU BANNER
-- =====================================================
INSERT INTO Banner (ma_phim, hinh_anh)
VALUES
(1, 'https://example.com/banners/avengers-banner.jpg'),
(2, 'https://example.com/banners/spiderman-banner.jpg'),
(3, 'https://example.com/banners/the-batman-banner.jpg'),
(4, 'https://example.com/banners/dune-banner.jpg'),
(7, 'https://example.com/banners/deadpool-wolverine-banner.jpg'),
(8, 'https://example.com/banners/avatar-3-banner.jpg');

-- =====================================================
-- 3. DỮ LIỆU HỆ THỐNG RẠP
-- =====================================================
INSERT INTO HeThongRap (ten_he_thong_rap, logo)
VALUES
(
    'CGV',
    'https://example.com/logos/cgv.png'
),
(
    'Lotte Cinema',
    'https://example.com/logos/lotte-cinema.png'
),
(
    'Galaxy Cinema',
    'https://example.com/logos/galaxy-cinema.png'
),
(
    'BHD Star Cineplex',
    'https://example.com/logos/bhd-star.png'
);

-- =====================================================
-- 4. DỮ LIỆU CỤM RẠP
-- =====================================================
INSERT INTO CumRap (ten_cum_rap, dia_chi, ma_he_thong_rap)
VALUES
(
    'CGV Vincom Đồng Khởi',
    '72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh',
    1
),
(
    'CGV Aeon Tân Phú',
    '30 Bờ Bao Tân Thắng, Quận Tân Phú, TP. Hồ Chí Minh',
    1
),
(
    'Lotte Cinema Gò Vấp',
    '242 Nguyễn Văn Lượng, Quận Gò Vấp, TP. Hồ Chí Minh',
    2
),
(
    'Lotte Cinema Nowzone',
    '235 Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh',
    2
),
(
    'Galaxy Nguyễn Du',
    '116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh',
    3
),
(
    'Galaxy Kinh Dương Vương',
    '718bis Kinh Dương Vương, Quận 6, TP. Hồ Chí Minh',
    3
),
(
    'BHD Star Bitexco',
    '2 Hải Triều, Quận 1, TP. Hồ Chí Minh',
    4
),
(
    'BHD Star Phạm Hùng',
    'Tầng 4, TTTM Satra Phạm Hùng, Bình Chánh, TP. Hồ Chí Minh',
    4
);

-- =====================================================
-- 5. DỮ LIỆU RẠP PHIM / PHÒNG CHIẾU
-- =====================================================
INSERT INTO RapPhim (ten_rap, ma_cum_rap)
VALUES
('Rạp 01', 1),
('Rạp 02', 1),
('Rạp IMAX', 1),

('Rạp 01', 2),
('Rạp 02', 2),

('Rạp 01', 3),
('Rạp 02', 3),

('Rạp 01', 4),
('Rạp 02', 4),

('Rạp 01', 5),
('Rạp 02', 5),

('Rạp 01', 6),
('Rạp 02', 6),

('Rạp 01', 7),
('Rạp 02', 7),

('Rạp 01', 8),
('Rạp 02', 8);

-- =====================================================
-- 6. DỮ LIỆU GHẾ
-- Mỗi rạp có 20 ghế:
-- A01-A08: Thường
-- B01-B08: Thường
-- C01-C04: VIP
-- =====================================================

INSERT INTO Ghe (ten_ghe, loai_ghe, ma_rap)
SELECT ten_ghe, loai_ghe, ma_rap
FROM (
    SELECT 'A01' AS ten_ghe, 'Thuong' AS loai_ghe
    UNION ALL SELECT 'A02', 'Thuong'
    UNION ALL SELECT 'A03', 'Thuong'
    UNION ALL SELECT 'A04', 'Thuong'
    UNION ALL SELECT 'A05', 'Thuong'
    UNION ALL SELECT 'A06', 'Thuong'
    UNION ALL SELECT 'A07', 'Thuong'
    UNION ALL SELECT 'A08', 'Thuong'

    UNION ALL SELECT 'B01', 'Thuong'
    UNION ALL SELECT 'B02', 'Thuong'
    UNION ALL SELECT 'B03', 'Thuong'
    UNION ALL SELECT 'B04', 'Thuong'
    UNION ALL SELECT 'B05', 'Thuong'
    UNION ALL SELECT 'B06', 'Thuong'
    UNION ALL SELECT 'B07', 'Thuong'
    UNION ALL SELECT 'B08', 'Thuong'

    UNION ALL SELECT 'C01', 'VIP'
    UNION ALL SELECT 'C02', 'VIP'
    UNION ALL SELECT 'C03', 'VIP'
    UNION ALL SELECT 'C04', 'VIP'
) AS danh_sach_ghe
CROSS JOIN RapPhim;

-- =====================================================
-- 7. DỮ LIỆU NGƯỜI DÙNG
-- Mật khẩu bên dưới chỉ dùng làm dữ liệu mẫu.
-- Khi xây dựng API thật cần mã hóa bằng bcrypt/argon2.
-- =====================================================
INSERT INTO NguoiDung
    (ho_ten, email, so_dt, mat_khau, loai_nguoi_dung)
VALUES
(
    'Quản trị viên',
    'admin@movie.com',
    '0900000001',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567890',
    'QuanTri'
),
(
    'Nguyễn Văn An',
    'an.nguyen@example.com',
    '0901000001',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567891',
    'KhachHang'
),
(
    'Trần Thị Bình',
    'binh.tran@example.com',
    '0901000002',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567892',
    'KhachHang'
),
(
    'Lê Hoàng Cường',
    'cuong.le@example.com',
    '0901000003',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567893',
    'KhachHang'
),
(
    'Phạm Minh Duy',
    'duy.pham@example.com',
    '0901000004',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567894',
    'KhachHang'
),
(
    'Hoàng Thu Hà',
    'ha.hoang@example.com',
    '0901000005',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567895',
    'KhachHang'
),
(
    'Võ Quốc Huy',
    'huy.vo@example.com',
    '0901000006',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567896',
    'KhachHang'
),
(
    'Đặng Ngọc Lan',
    'lan.dang@example.com',
    '0901000007',
    '$2b$10$abcdefghijklmnopqrstuv123456789012345678901234567897',
    'KhachHang'
);

-- =====================================================
-- 8. DỮ LIỆU LỊCH CHIẾU
-- =====================================================
INSERT INTO LichChieu
    (ma_rap, ma_phim, ngay_gio_chieu, gia_ve)
VALUES
-- Ngày 13/07/2026
(1, 1, '2026-07-13 09:00:00', 75000),
(1, 2, '2026-07-13 12:00:00', 80000),
(1, 3, '2026-07-13 15:00:00', 85000),
(2, 4, '2026-07-13 10:00:00', 85000),
(2, 5, '2026-07-13 13:00:00', 75000),
(3, 1, '2026-07-13 18:00:00', 150000),
(3, 4, '2026-07-13 21:00:00', 160000),

(4, 2, '2026-07-13 09:30:00', 75000),
(4, 6, '2026-07-13 12:30:00', 70000),
(5, 3, '2026-07-13 16:00:00', 85000),
(5, 5, '2026-07-13 19:00:00', 80000),

(6, 1, '2026-07-13 10:30:00', 70000),
(6, 4, '2026-07-13 14:00:00', 80000),
(7, 2, '2026-07-13 17:00:00', 80000),
(7, 6, '2026-07-13 20:00:00', 75000),

-- Ngày 14/07/2026
(8, 3, '2026-07-14 09:00:00', 75000),
(8, 5, '2026-07-14 12:00:00', 70000),
(9, 1, '2026-07-14 15:00:00', 85000),
(9, 4, '2026-07-14 18:30:00', 90000),

(10, 2, '2026-07-14 09:30:00', 75000),
(10, 6, '2026-07-14 12:30:00', 70000),
(11, 3, '2026-07-14 16:00:00', 80000),
(11, 5, '2026-07-14 19:00:00', 75000),

(12, 1, '2026-07-14 10:00:00', 70000),
(12, 4, '2026-07-14 13:30:00', 80000),
(13, 2, '2026-07-14 17:00:00', 80000),
(13, 6, '2026-07-14 20:00:00', 75000),

-- Ngày 15/07/2026
(14, 3, '2026-07-15 09:00:00', 75000),
(14, 5, '2026-07-15 12:00:00', 70000),
(15, 1, '2026-07-15 15:00:00', 85000),
(15, 4, '2026-07-15 18:30:00', 90000),

(16, 2, '2026-07-15 10:00:00', 75000),
(16, 6, '2026-07-15 13:00:00', 70000),
(17, 3, '2026-07-15 17:00:00', 80000),
(17, 5, '2026-07-15 20:00:00', 75000);

-- =====================================================
-- 9. DỮ LIỆU ĐẶT VÉ
--
-- Ghế được lấy bằng truy vấn con để bảo đảm ghế thuộc
-- đúng rạp của lịch chiếu.
-- =====================================================

-- Người dùng 2 đặt ghế A01, A02 cho lịch chiếu 1
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 2, 1, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 1
  AND g.ten_ghe IN ('A01', 'A02');

-- Người dùng 3 đặt ghế A03 cho lịch chiếu 1
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 3, 1, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 1
  AND g.ten_ghe = 'A03';

-- Người dùng 4 đặt ghế VIP C01, C02 cho lịch chiếu 2
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 4, 2, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 2
  AND g.ten_ghe IN ('C01', 'C02');

-- Người dùng 5 đặt ghế B04 cho lịch chiếu 3
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 5, 3, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 3
  AND g.ten_ghe = 'B04';

-- Người dùng 6 đặt ghế A05, A06 cho lịch chiếu 4
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 6, 4, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 4
  AND g.ten_ghe IN ('A05', 'A06');

-- Người dùng 7 đặt ghế C03 cho lịch chiếu 6
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 7, 6, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 6
  AND g.ten_ghe = 'C03';

-- Người dùng 8 đặt ghế B01, B02 cho lịch chiếu 8
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 8, 8, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 8
  AND g.ten_ghe IN ('B01', 'B02');

-- Người dùng 2 đặt ghế C04 cho lịch chiếu 10
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 2, 10, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 10
  AND g.ten_ghe = 'C04';

-- Người dùng 3 đặt ghế A07, A08 cho lịch chiếu 12
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 3, 12, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 12
  AND g.ten_ghe IN ('A07', 'A08');

-- Người dùng 4 đặt ghế B05 cho lịch chiếu 16
INSERT INTO DatVe (tai_khoan, ma_lich_chieu, ma_ghe)
SELECT 4, 16, g.ma_ghe
FROM Ghe g
JOIN LichChieu lc ON lc.ma_rap = g.ma_rap
WHERE lc.ma_lich_chieu = 16
  AND g.ten_ghe = 'B05';