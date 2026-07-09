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