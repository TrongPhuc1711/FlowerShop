import { db } from '../config/database';

async function migrateToSoapFlowers() {
  console.log('🌸 Chuyển đổi nghiệp vụ sang Hoa Giả & Hoa Sáp...');

  try {
    // 1. Cập nhật ENUM loai_san_pham trong bảng san_pham
    console.log('1. Cập nhật ENUM loai_san_pham...');
    await db.execute('DELETE FROM chi_tiet_ban_hang WHERE id > 0');
    await db.execute('DELETE FROM don_ban_hang WHERE id > 0');
    await db.execute('DELETE FROM san_pham WHERE id > 0');

    await db.execute(`
      ALTER TABLE san_pham 
      MODIFY COLUMN loai_san_pham ENUM('HOA_SAP','HOA_LUA','HOA_GIA','BO_HOA','GIO_HOA','PHU_KIEN','KHAC') NOT NULL DEFAULT 'HOA_SAP'
    `);

    // 2. Cập nhật danh mục sản phẩm phù hợp hoa giả, hoa sáp
    console.log('2. Cập nhật danh mục sản phẩm (danh_muc_san_pham)...');
    await db.execute('DELETE FROM danh_muc_san_pham WHERE id > 0');

    await db.execute(`
      INSERT INTO danh_muc_san_pham (id, ma_danh_muc, ten_danh_muc, mo_ta, trang_thai_hoat_dong) VALUES
      (1, 'HOA_SAP_THOM', 'Hoa Sáp Thơm Cao Cấp', 'Bó hoa sáp thơm 3 lớp, 4 lớp lưu hương lâu, cánh hoa mềm mịn', 1),
      (2, 'HOA_LUA_DECOR', 'Hoa Lụa Nghệ Thuật', 'Hoa lụa decor cao cấp, bình hoa để bàn sang trọng bền màu', 1),
      (3, 'HOP_HOA_SAP', 'Hộp Hoa Sáp Quà Tặng', 'Hộp hoa sáp trái tim, hộp quà kết hợp gấu bông, quà tặng ý nghĩa', 1),
      (4, 'HOA_SAP_TOT_NGHIEP', 'Bó Hoa Tốt Nghiệp & Sự Kiện', 'Bó hoa sáp tặng tốt nghiệp kèm cử nhân, tone màu tươi sáng', 1),
      (5, 'HOA_KHO_BAT_TU', 'Hoa Khô & Hoa Bất Tử', 'Hoa baby khô, hoa lavender, hoa bất tử phong cách vintage', 1)
    `);

    // 3. Cập nhật các sản phẩm mẫu sang hoa sáp và hoa lụa
    console.log('3. Cập nhật sản phẩm mẫu sang Hoa Sáp & Hoa Lụa...');

    await db.execute(`
      INSERT INTO san_pham (
        id, danh_muc_id, don_vi_tinh_id, ma_sku, ten_san_pham, loai_san_pham,
        gia_ban, gia_von_tham_khao, ton_kho_toi_thieu, theo_doi_lo,
        so_ngay_su_dung_du_kien, duong_dan_anh, mo_ta, trang_thai_hoat_dong
      ) VALUES
      (
        1, 1, 2, 'SP-HONG-SAP-DO-99',
        'Bó Hoa Hồng Sáp Đỏ 99 Bông Vĩnh Cửu',
        'HOA_SAP',
        650000.00, 280000.00, 10, FALSE, 1095,
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'Bó hoa 99 bông hồng sáp thơm cao cấp tượng trưng tình yêu vĩnh cửu. Cánh sáp xà phòng dập vân tự nhiên, lưu hương dịu nhẹ 2-3 năm, không tàn.',
        1
      ),
      (
        2, 1, 2, 'SP-HONG-SAP-PASTEL',
        'Bó Hoa Sáp Thơm Pastel Hàn Quốc (19 Bông)',
        'HOA_SAP',
        380000.00, 160000.00, 15, FALSE, 1095,
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        'Tone hồng pastel ngọt ngào phong cách Hàn Quốc kèm giấy gói cao cấp, thắt nơ ruy băng lụa. Hương thơm thanh khiết, làm quà sinh nhật tinh tế.',
        1
      ),
      (
        3, 3, 5, 'SP-HOP-TRAI-TIM-SAP',
        'Hộp Hoa Hồng Sáp Trái Tim Sang Trọng (Kèm Đèn LED)',
        'HOA_SAP',
        490000.00, 210000.00, 12, FALSE, 1095,
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
        'Hộp quà hình trái tim sang trọng kết hoa sáp thơm phối màu ombré, có dây đèn LED lung linh. Rất thích hợp làm quà tặng 8/3, 20/10, Valentine.',
        1
      ),
      (
        4, 2, 4, 'SP-BINH-HOA-LUA-PHU-QUY',
        'Bình Hoa Lụa Để Bàn Phòng Khách Phú Quý',
        'HOA_LUA',
        850000.00, 420000.00, 8, FALSE, 1825,
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80',
        'Bình gốm sứ cao cấp cắm phối hoa lụa lan hồ điệp và hoa mẫu đơn tinh tế. Độ bền màu trên 5 năm, dễ dàng lau chùi vệ sinh, tôn vẻ sang trọng cho phòng khách.',
        1
      ),
      (
        5, 4, 2, 'SP-BO-SAP-TOT-NGHIEP',
        'Bó Hoa Hướng Dương Sáp Tốt Nghiệp (Kèm Gấu Cử Nhân)',
        'HOA_SAP',
        320000.00, 130000.00, 20, FALSE, 1095,
        'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
        'Hoa hướng dương sáp rực rỡ tượng trưng cho tương lai tươi sáng, kết hợp chú gấu bông cử nhân tốt nghiệp dễ thương. Kỷ niệm bền đẹp theo thời gian.',
        1
      ),
      (
        6, 1, 2, 'SP-TULIP-SAP-XANH',
        'Bó Hoa Tulip Sáp Cao Cấp Màu Xanh Bơ Nhạt',
        'HOA_SAP',
        420000.00, 180000.00, 15, FALSE, 1095,
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
        'Hoa tulip sáp dẻo PU công nghệ mới, sờ vào cảm giác mềm mại như hoa thật. Tone xanh mint bơ nhạt thanh lịch và trendy.',
        1
      ),
      (
        7, 5, 2, 'SP-BO-BABY-KHO',
        'Bó Hoa Baby Khô Bất Tử Cầu Vồng Pastel',
        'HOA_GIA',
        350000.00, 150000.00, 15, FALSE, 730,
        'https://images.unsplash.com/photo-1589244159943-460088ed5c92?auto=format&fit=crop&w=800&q=80',
        'Hoa baby sấy khô công nghệ Nhật Bản, giữ màu sắc tự nhiên từ 1 - 2 năm, mùi thơm hoa cỏ thảo mộc dịu nhẹ.',
        1
      ),
      (
        8, 2, 5, 'SP-GIO-HOA-LUA-VINTAGE',
        'Giỏ Mây Hoa Lụa Vintage Trang Trí Quán Cafe / Bàn Trà',
        'HOA_LUA',
        520000.00, 240000.00, 10, FALSE, 1825,
        'https://images.unsplash.com/photo-1602615505188-0f04ca4c6ba4?auto=format&fit=crop&w=800&q=80',
        'Giỏ mây đan thủ công cắm hoa cúc họa mi và hoa hồng lụa tông vintage ấm cúng. Độ bền nhiều năm, không sợ ẩm mốc hay bụi bẩn.',
        1
      )
    `);

    // 4. Cập nhật mô tả vai trò khách hàng
    await db.execute(`
      UPDATE vai_tro 
      SET mo_ta = 'Khách hàng mua sắm hoa giả & hoa sáp'
      WHERE ma_vai_tro = 'CUSTOMER'
    `);

    console.log('✅ Đã chuyển đổi dữ liệu sản phẩm & danh mục sang Hoa Giả, Hoa Sáp thành công!');
  } catch (err: any) {
    console.error('❌ Lỗi khi chuyển đổi dữ liệu:', err.message);
  } finally {
    process.exit();
  }
}

migrateToSoapFlowers();
