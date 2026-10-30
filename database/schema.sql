-- ============================================================
-- DATABASE: flower_shop (v3 - Không có Vận chuyển & Mã vạch - 3NF)
-- MySQL 8.0.16+
-- ============================================================
CREATE DATABASE IF NOT EXISTS flower_shop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flower_shop;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_tong_hop_ton_kho, v_ton_kho_vat_tu, v_doanh_thu_ngay;
DROP TABLE IF EXISTS nhat_ky_he_thong, so_kho,
  chi_tiet_phieu_xuat_vat_tu, phieu_xuat_vat_tu, dinh_muc_vat_tu_san_pham, ton_kho_vat_tu, vat_tu,
  phan_bo_thanh_toan, chi_tiet_tra_hang_ban, phieu_tra_hang_ban,
  chi_tiet_tra_hang_nhap, phieu_tra_hang_nhap,
  thanh_toan, chi_tiet_ban_hang, don_ban_hang, chi_tiet_nhap_hang, phieu_nhap_hang, lo_hang,
  ton_kho_san_pham, san_pham, danh_muc_san_pham, don_vi_tinh,
  khach_hang, nha_cung_cap, nguoi_dung, vai_tro, kho_hang, chuong_trinh_khuyen_mai;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. NGƯỜI DÙNG & PHÂN QUYỀN
CREATE TABLE vai_tro (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_vai_tro VARCHAR(40) NOT NULL UNIQUE,
  ten_vai_tro VARCHAR(100) NOT NULL,
  mo_ta VARCHAR(255),
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE nguoi_dung (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vai_tro_id BIGINT UNSIGNED NOT NULL,
  ten_dang_nhap VARCHAR(80) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,
  ho_ten VARCHAR(150) NOT NULL,
  so_dien_thoai VARCHAR(30),
  email VARCHAR(190),
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  lan_dang_nhap_cuoi DATETIME NULL,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nguoi_dung_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES vai_tro(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 2. DANH MỤC ĐỐI TÁC & HỆ THỐNG PHỤ TRỢ
CREATE TABLE nha_cung_cap (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_nha_cung_cap VARCHAR(40) NOT NULL UNIQUE,
  ten_nha_cung_cap VARCHAR(180) NOT NULL,
  so_dien_thoai VARCHAR(30),
  email VARCHAR(190),
  ma_so_thue VARCHAR(40),
  dia_chi VARCHAR(255),
  nguoi_lien_he VARCHAR(150),
  cong_no_dau_ky DECIMAL(14,2) NOT NULL DEFAULT 0,
  ghi_chu TEXT,
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE khach_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nguoi_dung_id BIGINT UNSIGNED NULL,
  ma_khach_hang VARCHAR(40) NOT NULL UNIQUE,
  ho_ten VARCHAR(180) NOT NULL,
  so_dien_thoai VARCHAR(30),
  email VARCHAR(190),
  dia_chi VARCHAR(255),
  ngay_sinh DATE NULL,
  diem_tich_luy INT UNSIGNED NOT NULL DEFAULT 0,
  cong_no_dau_ky DECIMAL(14,2) NOT NULL DEFAULT 0,
  ghi_chu TEXT,
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_kh_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  INDEX idx_khach_hang_dien_thoai(so_dien_thoai)
) ENGINE=InnoDB;

CREATE TABLE kho_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_kho VARCHAR(40) NOT NULL UNIQUE,
  ten_kho VARCHAR(120) NOT NULL,
  dia_chi VARCHAR(255),
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE chuong_trinh_khuyen_mai (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_khuyen_mai VARCHAR(40) NOT NULL UNIQUE,
  ten_chuong_trinh VARCHAR(150) NOT NULL,
  loai_giam_gia ENUM('PHAN_TRAM','SO_TIEN') NOT NULL,
  gia_tri_giam DECIMAL(14,2) NOT NULL,
  gia_tri_don_hang_toi_thieu DECIMAL(14,2) NOT NULL DEFAULT 0,
  muc_giam_toi_da DECIMAL(14,2) NULL,
  thoi_gian_bat_dau DATETIME NULL,
  thoi_gian_ket_thuc DATETIME NULL,
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. SẢN PHẨM & ĐƠN VỊ TÍNH
CREATE TABLE danh_muc_san_pham (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  danh_muc_cha_id BIGINT UNSIGNED NULL,
  ma_danh_muc VARCHAR(40) NOT NULL UNIQUE,
  ten_danh_muc VARCHAR(120) NOT NULL,
  mo_ta TEXT,
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_danh_muc_cha FOREIGN KEY (danh_muc_cha_id) REFERENCES danh_muc_san_pham(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE don_vi_tinh (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_don_vi VARCHAR(30) NOT NULL UNIQUE,
  ten_don_vi VARCHAR(80) NOT NULL,
  cho_phep_le BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE san_pham (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  danh_muc_id BIGINT UNSIGNED NULL,
  don_vi_tinh_id BIGINT UNSIGNED NOT NULL,
  ma_sku VARCHAR(60) NOT NULL UNIQUE,
  ten_san_pham VARCHAR(200) NOT NULL,
  loai_san_pham ENUM('HOA_SAP','HOA_LUA','HOA_GIA','BO_HOA','GIO_HOA','PHU_KIEN','KHAC')
    NOT NULL DEFAULT 'HOA_SAP',
  gia_ban DECIMAL(14,2) NOT NULL DEFAULT 0,
  gia_von_tham_khao DECIMAL(14,4) NOT NULL DEFAULT 0,
  ton_kho_toi_thieu DECIMAL(14,3) NOT NULL DEFAULT 0,
  theo_doi_lo BOOLEAN NOT NULL DEFAULT TRUE,
  so_ngay_su_dung_du_kien SMALLINT UNSIGNED NULL,
  duong_dan_anh VARCHAR(255),
  mo_ta TEXT,
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_san_pham_danh_muc FOREIGN KEY (danh_muc_id) REFERENCES danh_muc_san_pham(id) ON DELETE SET NULL,
  CONSTRAINT fk_san_pham_don_vi FOREIGN KEY (don_vi_tinh_id) REFERENCES don_vi_tinh(id),
  INDEX idx_san_pham_ten(ten_san_pham)
) ENGINE=InnoDB;

-- 4. VẬT TƯ & ĐỊNH MỨC
CREATE TABLE vat_tu (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  don_vi_tinh_id BIGINT UNSIGNED NOT NULL,
  ma_vat_tu VARCHAR(60) NOT NULL UNIQUE,
  ten_vat_tu VARCHAR(200) NOT NULL,
  nhom_vat_tu ENUM('GIAY_GOI','NO_RUY_BANG','MUT_XOP','GIO_BINH_HOA','BAO_BI','THIEP','DUNG_CU','KHAC')
    NOT NULL DEFAULT 'KHAC',
  gia_von_binh_quan DECIMAL(14,4) NOT NULL DEFAULT 0,
  ton_kho_toi_thieu DECIMAL(14,3) NOT NULL DEFAULT 0,
  ghi_chu VARCHAR(255),
  trang_thai_hoat_dong BOOLEAN NOT NULL DEFAULT TRUE,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vat_tu_don_vi FOREIGN KEY (don_vi_tinh_id) REFERENCES don_vi_tinh(id),
  INDEX idx_vat_tu_ten(ten_vat_tu)
) ENGINE=InnoDB;

CREATE TABLE ton_kho_vat_tu (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vat_tu_id BIGINT UNSIGNED NOT NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  so_luong DECIMAL(14,3) NOT NULL DEFAULT 0,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ton_kho_vat_tu (vat_tu_id, kho_hang_id),
  CONSTRAINT fk_tk_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id) ON DELETE CASCADE,
  CONSTRAINT fk_tk_vat_tu_kho FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE dinh_muc_vat_tu_san_pham (
  san_pham_id BIGINT UNSIGNED NOT NULL,
  vat_tu_id BIGINT UNSIGNED NOT NULL,
  so_luong_su_dung DECIMAL(14,3) NOT NULL,
  PRIMARY KEY (san_pham_id, vat_tu_id),
  CONSTRAINT fk_dmvt_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE,
  CONSTRAINT fk_dmvt_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id) ON DELETE CASCADE,
  CONSTRAINT ck_dmvt_so_luong CHECK (so_luong_su_dung > 0)
) ENGINE=InnoDB;

-- 5. TỒN KHO SẢN PHẨM
CREATE TABLE ton_kho_san_pham (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  san_pham_id BIGINT UNSIGNED NOT NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  so_luong DECIMAL(14,3) NOT NULL DEFAULT 0,
  so_luong_giu_cho DECIMAL(14,3) NOT NULL DEFAULT 0,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ton_kho_san_pham (san_pham_id, kho_hang_id),
  CONSTRAINT fk_tk_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE CASCADE,
  CONSTRAINT fk_tk_san_pham_kho FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. NHẬP HÀNG & LÔ HÀNG
CREATE TABLE phieu_nhap_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_nhap VARCHAR(40) NOT NULL UNIQUE,
  nha_cung_cap_id BIGINT UNSIGNED NOT NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  nguoi_tao_id BIGINT UNSIGNED NOT NULL,
  ngay_nhap DATE NOT NULL,
  trang_thai ENUM('NHAP_NHAI','DA_XAC_NHAN','DA_NHAP_KHO','DA_HUY') NOT NULL DEFAULT 'NHAP_NHAI',
  tong_tien_hang DECIMAL(14,2) NOT NULL DEFAULT 0,
  tien_chiet_khau DECIMAL(14,2) NOT NULL DEFAULT 0,
  tien_thue DECIMAL(14,2) NOT NULL DEFAULT 0,
  phi_van_chuyen DECIMAL(14,2) NOT NULL DEFAULT 0,
  phuong_thuc_phan_bo_vc ENUM('THEO_GIA_TRI','THEO_SO_LUONG','KHONG_PHAN_BO') NOT NULL DEFAULT 'THEO_GIA_TRI',
  tong_thanh_toan DECIMAL(14,2) AS (tong_tien_hang - tien_chiet_khau + tien_thue + phi_van_chuyen) STORED,
  tong_cong_no_ncc DECIMAL(14,2) AS (tong_tien_hang - tien_chiet_khau + tien_thue + phi_van_chuyen) STORED,
  da_thanh_toan DECIMAL(14,2) NOT NULL DEFAULT 0,
  trang_thai_thanh_toan ENUM('CHUA_THANH_TOAN','THANH_TOAN_MOT_PHAN','DA_THANH_TOAN') NOT NULL DEFAULT 'CHUA_THANH_TOAN',
  thoi_gian_nhap_thuc_te DATETIME NULL,
  nguoi_nhap_kho_id BIGINT UNSIGNED NULL,
  ghi_chu TEXT,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pnh_nha_cung_cap FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
  CONSTRAINT fk_pnh_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_pnh_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id),
  CONSTRAINT fk_pnh_nguoi_nhan FOREIGN KEY (nguoi_nhap_kho_id) REFERENCES nguoi_dung(id),
  INDEX idx_pnh_ngay_nhap(ngay_nhap),
  INDEX idx_pnh_ncc(nha_cung_cap_id)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_nhap_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phieu_nhap_id BIGINT UNSIGNED NOT NULL,
  loai_hang_hoa ENUM('SAN_PHAM','VAT_TU') NOT NULL,
  san_pham_id BIGINT UNSIGNED NULL,
  vat_tu_id BIGINT UNSIGNED NULL,
  so_luong DECIMAL(14,3) NOT NULL,
  gia_nhap DECIMAL(14,4) NOT NULL,
  tien_chiet_khau DECIMAL(14,2) NOT NULL DEFAULT 0,
  han_su_dung_du_kien DATE NULL,
  cuoc_vc_phan_bo DECIMAL(14,2) NOT NULL DEFAULT 0,
  thanh_tien DECIMAL(14,2) AS (ROUND(so_luong * gia_nhap - tien_chiet_khau, 2)) STORED,
  gia_nhap_thuan DECIMAL(14,4) AS (ROUND((so_luong * gia_nhap - tien_chiet_khau) / so_luong, 4)) STORED,
  cuoc_vc_don_vi DECIMAL(14,4) AS (ROUND(cuoc_vc_phan_bo / so_luong, 4)) STORED,
  gia_von_thuc_te DECIMAL(14,4) AS
    (ROUND((so_luong * gia_nhap - tien_chiet_khau + cuoc_vc_phan_bo) / so_luong, 4)) STORED,
  CONSTRAINT fk_ctnh_phieu_nhap FOREIGN KEY (phieu_nhap_id) REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctnh_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL,
  CONSTRAINT fk_ctnh_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id) ON DELETE SET NULL,
  CONSTRAINT ck_ctnh_so_luong CHECK (so_luong > 0)
) ENGINE=InnoDB;

CREATE TABLE lo_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  san_pham_id BIGINT UNSIGNED NOT NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  chi_tiet_nhap_id BIGINT UNSIGNED NULL,
  ma_lo VARCHAR(60) NOT NULL UNIQUE,
  ngay_nhap DATE NOT NULL,
  han_su_dung DATE NULL,
  so_luong_nhap DECIMAL(14,3) NOT NULL,
  so_luong_con_lai DECIMAL(14,3) NOT NULL,
  gia_nhap DECIMAL(14,4) NOT NULL,
  cuoc_vc_don_vi DECIMAL(14,4) NOT NULL DEFAULT 0,
  gia_von_thuc_te DECIMAL(14,4) AS (gia_nhap + cuoc_vc_don_vi) STORED,
  trang_thai ENUM('DANG_BAN','HET_HANG','HET_HAN','DA_HUY') NOT NULL DEFAULT 'DANG_BAN',
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lo_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id),
  CONSTRAINT fk_lo_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_lo_chi_tiet_nhap FOREIGN KEY (chi_tiet_nhap_id) REFERENCES chi_tiet_nhap_hang(id) ON DELETE SET NULL,
  INDEX idx_lo_fefo (san_pham_id, kho_hang_id, trang_thai, han_su_dung, ngay_nhap)
) ENGINE=InnoDB;

-- 7. BÁN HÀNG
CREATE TABLE don_ban_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_don_hang VARCHAR(40) NOT NULL UNIQUE,
  khach_hang_id BIGINT UNSIGNED NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  thu_ngan_id BIGINT UNSIGNED NOT NULL,
  khuyen_mai_id BIGINT UNSIGNED NULL,
  thoi_gian_ban DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kenh_ban ENUM('POS','DIEN_THOAI','ZALO','FACEBOOK','WEBSITE','KHAC') NOT NULL DEFAULT 'POS',
  hinh_thuc_nhan ENUM('TAI_QUAY','GIAO_HANG') NOT NULL DEFAULT 'TAI_QUAY',
  trang_thai ENUM('NHAP_NHAI','DA_XAC_NHAN','HOAN_THANH','DA_HUY') NOT NULL DEFAULT 'NHAP_NHAI',
  tong_tien_hang DECIMAL(14,2) NOT NULL DEFAULT 0,
  tien_chiet_khau DECIMAL(14,2) NOT NULL DEFAULT 0,
  tien_thue DECIMAL(14,2) NOT NULL DEFAULT 0,
  phi_giao_hang DECIMAL(14,2) NOT NULL DEFAULT 0,
  tong_thanh_toan DECIMAL(14,2) AS (tong_tien_hang - tien_chiet_khau + tien_thue + phi_giao_hang) STORED,
  da_thanh_toan DECIMAL(14,2) NOT NULL DEFAULT 0,
  trang_thai_thanh_toan ENUM('CHUA_THANH_TOAN','THANH_TOAN_MOT_PHAN','DA_THANH_TOAN') NOT NULL DEFAULT 'CHUA_THANH_TOAN',
  diem_tich_luy_nhan INT UNSIGNED NOT NULL DEFAULT 0,
  ghi_chu TEXT,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dbh_khach_hang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_dbh_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_dbh_thu_ngan FOREIGN KEY (thu_ngan_id) REFERENCES nguoi_dung(id),
  CONSTRAINT fk_dbh_khuyen_mai FOREIGN KEY (khuyen_mai_id) REFERENCES chuong_trinh_khuyen_mai(id) ON DELETE SET NULL,
  INDEX idx_dbh_thoi_gian(thoi_gian_ban),
  INDEX idx_dbh_khach_hang(khach_hang_id)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_ban_hang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  don_ban_hang_id BIGINT UNSIGNED NOT NULL,
  san_pham_id BIGINT UNSIGNED NOT NULL,
  lo_hang_id BIGINT UNSIGNED NULL,
  so_luong DECIMAL(14,3) NOT NULL,
  don_gia DECIMAL(14,2) NOT NULL,
  tien_chiet_khau DECIMAL(14,2) NOT NULL DEFAULT 0,
  thanh_tien DECIMAL(14,2) AS (ROUND(so_luong * don_gia - tien_chiet_khau, 2)) STORED,
  gia_von_tai_thoi_diem_ban DECIMAL(14,4) NOT NULL DEFAULT 0,
  cuoc_vc_don_vi_ban DECIMAL(14,4) NOT NULL DEFAULT 0,
  CONSTRAINT fk_ctbh_don_ban FOREIGN KEY (don_ban_hang_id) REFERENCES don_ban_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctbh_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id),
  CONSTRAINT fk_ctbh_lo_hang FOREIGN KEY (lo_hang_id) REFERENCES lo_hang(id) ON DELETE SET NULL,
  CONSTRAINT ck_ctbh_so_luong CHECK (so_luong > 0)
) ENGINE=InnoDB;

-- 8. THANH TOÁN, ĐỔI TRẢ & CÔNG NỢ
CREATE TABLE thanh_toan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_thanh_toan VARCHAR(40) NOT NULL UNIQUE,
  huong_giao_dich ENUM('THU','CHI') NOT NULL,
  loai_doi_tac ENUM('KHACH_HANG','NHA_CUNG_CAP') NOT NULL,
  khach_hang_id BIGINT UNSIGNED NULL,
  nha_cung_cap_id BIGINT UNSIGNED NULL,
  phuong_thuc_thanh_toan ENUM('TIEN_MAT','CHUYEN_KHOAN','THE','VÍ_DIEN_TU','KHAC') NOT NULL DEFAULT 'TIEN_MAT',
  so_tien DECIMAL(14,2) NOT NULL,
  thoi_gian_thanh_toan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ma_tham_chieu VARCHAR(80),
  nguoi_tao_id BIGINT UNSIGNED NOT NULL,
  ghi_chu VARCHAR(255),
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tt_khach_hang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_tt_nha_cung_cap FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id) ON DELETE SET NULL,
  CONSTRAINT fk_tt_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id),
  CONSTRAINT ck_tt_so_tien CHECK (so_tien > 0),
  INDEX idx_tt_thoi_gian(thoi_gian_thanh_toan)
) ENGINE=InnoDB;

CREATE TABLE phieu_tra_hang_ban (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_tra VARCHAR(40) NOT NULL UNIQUE,
  don_ban_hang_id BIGINT UNSIGNED NOT NULL,
  khach_hang_id BIGINT UNSIGNED NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  thoi_gian_tra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('NHAP_NHAI','HOAN_THANH','DA_HUY') NOT NULL DEFAULT 'NHAP_NHAI',
  tien_hoan_lai_hang DECIMAL(14,2) NOT NULL DEFAULT 0,
  tien_hoan_lai_phi_vc DECIMAL(14,2) NOT NULL DEFAULT 0,
  hinh_thuc_hoan_tien ENUM('TIEN_MAT','CHUYEN_KHOAN','VI_DIEN_TU','BU_TRU_CONG_NO','KHAC') NOT NULL DEFAULT 'TIEN_MAT',
  ly_do VARCHAR(255),
  nguoi_tao_id BIGINT UNSIGNED NOT NULL,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pthb_don_ban FOREIGN KEY (don_ban_hang_id) REFERENCES don_ban_hang(id),
  CONSTRAINT fk_pthb_khach_hang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_pthb_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_pthb_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id),
  INDEX idx_pthb_thoi_gian(thoi_gian_tra)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_tra_hang_ban (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phieu_tra_hang_ban_id BIGINT UNSIGNED NOT NULL,
  chi_tiet_ban_hang_id BIGINT UNSIGNED NOT NULL,
  san_pham_id BIGINT UNSIGNED NULL,
  lo_hang_id BIGINT UNSIGNED NULL,
  so_luong DECIMAL(14,3) NOT NULL,
  don_gia DECIMAL(14,2) NOT NULL,
  thanh_tien DECIMAL(14,2) AS (ROUND(so_luong * don_gia, 2)) STORED,
  gia_von_tai_thoi_diem DECIMAL(14,4) NOT NULL DEFAULT 0,
  cuoc_vc_don_vi DECIMAL(14,4) NOT NULL DEFAULT 0,
  nhap_lai_kho BOOLEAN NOT NULL DEFAULT TRUE,
  ly_do VARCHAR(255),
  CONSTRAINT fk_ctthb_phieu_tra FOREIGN KEY (phieu_tra_hang_ban_id) REFERENCES phieu_tra_hang_ban(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctthb_ctbh FOREIGN KEY (chi_tiet_ban_hang_id) REFERENCES chi_tiet_ban_hang(id),
  CONSTRAINT fk_ctthb_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL,
  CONSTRAINT fk_ctthb_lo_hang FOREIGN KEY (lo_hang_id) REFERENCES lo_hang(id) ON DELETE SET NULL,
  CONSTRAINT ck_ctthb_so_luong CHECK (so_luong > 0)
) ENGINE=InnoDB;

CREATE TABLE phieu_tra_hang_nhap (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_tra_nhap VARCHAR(40) NOT NULL UNIQUE,
  phieu_nhap_hang_id BIGINT UNSIGNED NOT NULL,
  nha_cung_cap_id BIGINT UNSIGNED NOT NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  thoi_gian_tra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('NHAP_NHAI','HOAN_THANH','DA_HUY') NOT NULL DEFAULT 'NHAP_NHAI',
  tong_tien_hoan DECIMAL(14,2) NOT NULL DEFAULT 0,
  ly_do VARCHAR(255),
  nguoi_tao_id BIGINT UNSIGNED NOT NULL,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pthn_phieu_nhap FOREIGN KEY (phieu_nhap_hang_id) REFERENCES phieu_nhap_hang(id),
  CONSTRAINT fk_pthn_nha_cung_cap FOREIGN KEY (nha_cung_cap_id) REFERENCES nha_cung_cap(id),
  CONSTRAINT fk_pthn_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_pthn_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_tra_hang_nhap (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phieu_tra_hang_nhap_id BIGINT UNSIGNED NOT NULL,
  chi_tiet_nhap_hang_id BIGINT UNSIGNED NOT NULL,
  loai_hang_hoa ENUM('SAN_PHAM','VAT_TU') NOT NULL,
  san_pham_id BIGINT UNSIGNED NULL,
  vat_tu_id BIGINT UNSIGNED NULL,
  lo_hang_id BIGINT UNSIGNED NULL,
  so_luong DECIMAL(14,3) NOT NULL,
  gia_nhap DECIMAL(14,4) NOT NULL,
  thanh_tien DECIMAL(14,2) AS (ROUND(so_luong * gia_nhap, 2)) STORED,
  ly_do VARCHAR(255),
  CONSTRAINT fk_ctthn_phieu_tra FOREIGN KEY (phieu_tra_hang_nhap_id) REFERENCES phieu_tra_hang_nhap(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctthn_ctnh FOREIGN KEY (chi_tiet_nhap_hang_id) REFERENCES chi_tiet_nhap_hang(id),
  CONSTRAINT fk_ctthn_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL,
  CONSTRAINT fk_ctthn_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id) ON DELETE SET NULL,
  CONSTRAINT fk_ctthn_lo_hang FOREIGN KEY (lo_hang_id) REFERENCES lo_hang(id) ON DELETE SET NULL,
  CONSTRAINT ck_ctthn_so_luong CHECK (so_luong > 0)
) ENGINE=InnoDB;

CREATE TABLE phan_bo_thanh_toan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  thanh_toan_id BIGINT UNSIGNED NOT NULL,
  don_ban_hang_id BIGINT UNSIGNED NULL,
  phieu_nhap_hang_id BIGINT UNSIGNED NULL,
  phieu_tra_hang_ban_id BIGINT UNSIGNED NULL,
  phieu_tra_hang_nhap_id BIGINT UNSIGNED NULL,
  so_tien DECIMAL(14,2) NOT NULL,
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pbtt_thanh_toan FOREIGN KEY (thanh_toan_id) REFERENCES thanh_toan(id) ON DELETE CASCADE,
  CONSTRAINT fk_pbtt_don_ban FOREIGN KEY (don_ban_hang_id) REFERENCES don_ban_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_pbtt_phieu_nhap FOREIGN KEY (phieu_nhap_hang_id) REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
  CONSTRAINT fk_pbtt_phieu_tra_ban FOREIGN KEY (phieu_tra_hang_ban_id) REFERENCES phieu_tra_hang_ban(id) ON DELETE CASCADE,
  CONSTRAINT fk_pbtt_phieu_tra_nhap FOREIGN KEY (phieu_tra_hang_nhap_id) REFERENCES phieu_tra_hang_nhap(id) ON DELETE CASCADE,
  CONSTRAINT ck_pbtt_so_tien CHECK (so_tien > 0)
) ENGINE=InnoDB;

-- 9. XUẤT DÙNG VẬT TƯ
CREATE TABLE phieu_xuat_vat_tu (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ma_phieu_xuat VARCHAR(40) NOT NULL UNIQUE,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  loai_xuat ENUM('SAN_XUAT_DON_HANG','HA_HO_CONG_VU','SU_DUNG_NOI_BO','DIEU_CHINH_KHO') NOT NULL,
  don_ban_hang_id BIGINT UNSIGNED NULL,
  nguoi_tao_id BIGINT UNSIGNED NOT NULL,
  thoi_gian_xuat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('DA_GHI_SO','DA_HUY') NOT NULL DEFAULT 'DA_GHI_SO',
  ghi_chu VARCHAR(255),
  CONSTRAINT fk_pxvt_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_pxvt_don_ban FOREIGN KEY (don_ban_hang_id) REFERENCES don_ban_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_pxvt_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id),
  INDEX idx_pxvt_thoi_gian(thoi_gian_xuat),
  INDEX idx_pxvt_don_ban(don_ban_hang_id)
) ENGINE=InnoDB;

CREATE TABLE chi_tiet_phieu_xuat_vat_tu (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phieu_xuat_vat_tu_id BIGINT UNSIGNED NOT NULL,
  vat_tu_id BIGINT UNSIGNED NOT NULL,
  chi_tiet_ban_hang_id BIGINT UNSIGNED NULL,
  so_luong DECIMAL(14,3) NOT NULL,
  gia_von DECIMAL(14,4) NOT NULL,
  thanh_tien DECIMAL(14,2) AS (ROUND(so_luong * gia_von, 2)) STORED,
  CONSTRAINT fk_ctpxvt_phieu_xuat FOREIGN KEY (phieu_xuat_vat_tu_id) REFERENCES phieu_xuat_vat_tu(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctpxvt_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id),
  CONSTRAINT fk_ctpxvt_ctbh FOREIGN KEY (chi_tiet_ban_hang_id) REFERENCES chi_tiet_ban_hang(id) ON DELETE SET NULL,
  CONSTRAINT ck_ctpxvt_so_luong CHECK (so_luong > 0)
) ENGINE=InnoDB;

-- 10. SỔ KHO & NHẬT KÝ
CREATE TABLE so_kho (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loai_hang_hoa ENUM('SAN_PHAM','VAT_TU') NOT NULL,
  san_pham_id BIGINT UNSIGNED NULL,
  vat_tu_id BIGINT UNSIGNED NULL,
  lo_hang_id BIGINT UNSIGNED NULL,
  kho_hang_id BIGINT UNSIGNED NOT NULL,
  loai_bien_dong ENUM('NHAP_MUA','XUAT_BAN','NHAP_TRA_HANG','XUAT_TRA_NCC',
                     'XUAT_VAT_TU','NHAP_DIEU_CHINH','XUAT_DIEU_CHINH','HU_HONG',
                     'NHAP_CHUYEN_KHO','XUAT_CHUYEN_KHO') NOT NULL,
  thay_doi_so_luong DECIMAL(14,3) NOT NULL,
  gia_von DECIMAL(14,4) NOT NULL DEFAULT 0,
  loai_chung_tu_goc VARCHAR(40) NULL,
  id_chung_tu_goc BIGINT UNSIGNED NULL,
  nguoi_tao_id BIGINT UNSIGNED NULL,
  ghi_chu VARCHAR(255),
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sk_san_pham FOREIGN KEY (san_pham_id) REFERENCES san_pham(id) ON DELETE SET NULL,
  CONSTRAINT fk_sk_vat_tu FOREIGN KEY (vat_tu_id) REFERENCES vat_tu(id) ON DELETE SET NULL,
  CONSTRAINT fk_sk_lo_hang FOREIGN KEY (lo_hang_id) REFERENCES lo_hang(id) ON DELETE SET NULL,
  CONSTRAINT fk_sk_kho_hang FOREIGN KEY (kho_hang_id) REFERENCES kho_hang(id),
  CONSTRAINT fk_sk_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  INDEX idx_sk_san_pham(san_pham_id, ngay_tao),
  INDEX idx_sk_vat_tu(vat_tu_id, ngay_tao),
  INDEX idx_sk_chung_tu(loai_chung_tu_goc, id_chung_tu_goc),
  INDEX idx_sk_bien_dong(loai_bien_dong, ngay_tao)
) ENGINE=InnoDB;

CREATE TABLE nhat_ky_he_thong (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nguoi_dung_id BIGINT UNSIGNED NULL,
  hanh_dong VARCHAR(60) NOT NULL,
  loai_doi_tuong VARCHAR(60) NOT NULL,
  id_doi_tuong BIGINT UNSIGNED NULL,
  gia_tri_cu JSON NULL,
  gia_tri_moi JSON NULL,
  dia_chi_ip VARCHAR(45),
  ngay_tao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_nk_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE SET NULL,
  INDEX idx_nk_doi_tuong(loai_doi_tuong, id_doi_tuong),
  INDEX idx_nk_ngay_tao(ngay_tao)
) ENGINE=InnoDB;

-- 11. VIEWS
CREATE VIEW v_tong_hop_ton_kho AS
SELECT p.id AS san_pham_id, p.ma_sku, p.ten_san_pham, w.id AS kho_hang_id, w.ten_kho AS ten_kho_hang,
       COALESCE(i.so_luong,0) AS so_luong,
       p.ton_kho_toi_thieu,
       (COALESCE(i.so_luong,0) < p.ton_kho_toi_thieu) AS sap_het_hang,
       COALESCE(b.gia_tri_ton_kho,0) AS gia_tri_ton_kho,
       b.han_su_dung_gan_nhat
FROM san_pham p
JOIN kho_hang w
LEFT JOIN ton_kho_san_pham i ON i.san_pham_id = p.id AND i.kho_hang_id = w.id
LEFT JOIN (
  SELECT san_pham_id, kho_hang_id,
         SUM(so_luong_con_lai * gia_von_thuc_te) AS gia_tri_ton_kho,
         MIN(CASE WHEN so_luong_con_lai > 0 THEN han_su_dung END) AS han_su_dung_gan_nhat
  FROM lo_hang WHERE trang_thai = 'DANG_BAN'
  GROUP BY san_pham_id, kho_hang_id
) b ON b.san_pham_id = p.id AND b.kho_hang_id = w.id
WHERE p.trang_thai_hoat_dong = 1 AND w.trang_thai_hoat_dong = 1;

CREATE VIEW v_ton_kho_vat_tu AS
SELECT m.id AS vat_tu_id, m.ma_vat_tu, m.ten_vat_tu, m.nhom_vat_tu,
       w.id AS kho_hang_id, w.ten_kho AS ten_kho_hang,
       COALESCE(ms.so_luong,0) AS so_luong,
       m.gia_von_binh_quan,
       ROUND(COALESCE(ms.so_luong,0) * m.gia_von_binh_quan, 2) AS gia_tri_ton_kho,
       m.ton_kho_toi_thieu,
       (COALESCE(ms.so_luong,0) < m.ton_kho_toi_thieu) AS sap_het_hang
FROM vat_tu m
JOIN kho_hang w
LEFT JOIN ton_kho_vat_tu ms ON ms.vat_tu_id = m.id AND ms.kho_hang_id = w.id
WHERE m.trang_thai_hoat_dong = 1 AND w.trang_thai_hoat_dong = 1;

CREATE VIEW v_doanh_thu_ngay AS
SELECT DATE(thoi_gian_ban) AS ngay_ban,
       COUNT(*) AS tong_so_don,
       SUM(tong_tien_hang) AS doanh_thu_hang_hoa,
       SUM(tien_chiet_khau) AS tong_chiet_khau,
       SUM(tien_thue) AS tong_thue,
       SUM(phi_giao_hang) AS tong_phi_giao_hang,
       SUM(tong_thanh_toan) AS tong_doanh_thu
FROM don_ban_hang
WHERE trang_thai = 'HOAN_THANH'
GROUP BY DATE(thoi_gian_ban);

-- SEED DATA
INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta) VALUES
  ('ADMIN', 'Quản trị viên', 'Toàn quyền hệ thống'),
  ('MANAGER', 'Quản lý', 'Quản lý cửa hàng'),
  ('CASHIER', 'Thu ngân', 'Bán hàng và thu tiền'),
  ('WAREHOUSE', 'Thủ kho', 'Quản lý kho hàng'),
  ('CUSTOMER', 'Khách hàng', 'Khách hàng mua sắm hoa giả & hoa sáp');

INSERT INTO nguoi_dung (vai_tro_id, ten_dang_nhap, mat_khau_hash, ho_ten, email) VALUES
  (1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Hệ Thống', 'admin@flowershop.vn');

INSERT INTO don_vi_tinh (ma_don_vi, ten_don_vi, cho_phep_le) VALUES
  ('CANH', 'Cành', FALSE),
  ('BO', 'Bó', FALSE),
  ('GIO', 'Giỏ', FALSE),
  ('CHAU', 'Chậu', FALSE),
  ('CAI', 'Cái', FALSE),
  ('MET', 'Mét', TRUE),
  ('CUON', 'Cuộn', FALSE),
  ('TO', 'Tờ', FALSE),
  ('HOP', 'Hộp', FALSE);

INSERT INTO kho_hang (ma_kho, ten_kho, dia_chi) VALUES
  ('KHO-CHINH', 'Kho Chính', '123 Nguyễn Huệ, Q.1, TP.HCM');
