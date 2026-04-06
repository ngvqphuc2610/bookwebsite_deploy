-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 28, 2026 lúc 02:26 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nhom8_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stories`
--

CREATE TABLE `stories` (
  `id` bigint(20) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_premium` bit(1) NOT NULL,
  `status` enum('COMPLETED','DROPPED','ONGOING') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `view_count` bigint(20) NOT NULL,
  `creator_id` bigint(20) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stories`
--

INSERT INTO `stories` (`id`, `author`, `cover_image`, `created_at`, `description`, `is_premium`, `status`, `title`, `updated_at`, `view_count`, `creator_id`, `slug`) VALUES
(6, 'Bdcomics', 'https://img.otruyenapi.com/uploads/comics/vi-du-that-bai-cua-loi-nguyen-hoan-hao-thumb.jpg', '2026-03-06 09:17:06.000000', 'Truyện tranh Ví Dụ Thất Bại Của Lời Nguyền Hoàn Hảo được cập nhật nhanh và đầy đủ nhất tại TruyenQQ. Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ TruyenQQ ra các chương mới nhất của truyện Ví Dụ Thất Bại Của Lời Nguyền Hoàn Hảo.', b'0', 'ONGOING', 'Ví Dụ Thất Bại Của Lời Nguyền Hoàn Hảo', '2026-03-12 15:47:31.000000', 53445, 2, 'vi-du-that-bai-cua-loi-nguyen-hoan-hao'),
(7, 'Kishitani Todoroki, Uratani Nagi', 'https://img.otruyenapi.com/uploads/comics/r15-ja-dame-desuka-thumb.jpg', '2026-03-06 10:07:38.000000', '\"Mình sẽ làm gì để trở thành người lớn?\" Akane Amou, lớn lên trong sự bảo bọc nghiêm khắc của cha mẹ mà không tiếp xúc với phương tiện giải trí, bước qua tuổi 15, trước những thứ \"tình cảm\", thậm chí là một nụ hôn cũng không thể xem được. Giờ đã vào trường cấp ba, cùng với cậu bạn Fuyumine, Amou sẽ bước qua những rào cản ấy. Liệu cô bé có thể xem được một phim nhán mác \"cấm trẻ em\"? (Truyện dành cho lứa tuổi 16+)', b'0', 'ONGOING', 'R15+ Ja Dame Desuka?', '2026-03-06 10:07:38.000000', 4354, 2, 'r15-ja-dame-desuka'),
(8, 'Kishitani Todoroki, Uratani Nagi', 'https://img.otruyenapi.com/uploads/comics/xem-phim-nguoi-lon-duoc-khong-thumb.jpg', '2026-03-06 10:07:39.000000', '(Truyện dành cho lứa tuổi 16+)\"Mình sẽ làm gì để trở thành người lớn?\" Akane Amou, lớn lên trong sự bảo bọc nghiêm khắc của cha mẹ mà không tiếp xúc với phương tiện giải trí, bước qua tuổi 15, trước những thứ \"tình cảm\", thậm chí là một nụ hôn cũng không thể xem được. Giờ đã vào trường cấp ba, cùng với cậu bạn Fuyumine, Amou sẽ bước qua những rào cản ấy. Liệu cô bé có thể xem được một phim nhán mác \"cấm trẻ em\"?', b'0', 'ONGOING', 'Xem Phim', '2026-03-06 10:07:39.000000', 54335, 2, 'xem-phim-nguoi-lon-duoc-khong'),
(9, '', 'https://img.otruyenapi.com/uploads/comics/wizards-soul-koi-no-seisen-thumb.jpg', '2026-03-06 10:08:01.000000', 'Truyện tranh Wizard\'s Soul ~Koi No Seisen~ được cập nhật nhanh và đầy đủ nhất tại TruyenQQ. Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ TruyenQQ ra các chương mới nhất của truyện Wizard\'s Soul ~Koi No Seisen~.', b'0', 'ONGOING', 'Wizard\'s Soul ~Koi No Seisen~', '2026-03-06 10:08:01.000000', 765, 2, 'wizards-soul-koi-no-seisen'),
(10, '', 'https://img.otruyenapi.com/uploads/comics/tro-thanh-vo-dich-bang-he-thong-giam-gia-tri-thumb.jpg', '2026-03-06 10:08:17.000000', 'Truyện tranh Trở Thành Vô Địch Bằng Hệ Thống Giảm Giá Trị được cập nhật nhanh và đầy đủ nhất tại . Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ ra các chương mới nhất của truyện Trở Thành Vô Địch Bằng Hệ Thống Giảm Giá Trị.', b'0', 'ONGOING', 'Trở Thành Vô Địch Bằng Hệ Thống Giảm Giá Trị', '2026-03-06 10:08:17.000000', 54654, 2, 'tro-thanh-vo-dich-bang-he-thong-giam-gia-tri'),
(11, 'Đang cập nhật', 'https://img.otruyenapi.com/uploads/comics/toi-da-giet-tuyen-thu-hoc-vien-thumb.jpg', '2026-03-06 10:08:31.000000', 'Truyện tranh Tôi Đã Giết Tuyển Thủ Học Viện được cập nhật nhanh và đầy đủ nhất tại . Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ ra các chương mới nhất của truyện Tôi Đã Giết Tuyển Thủ Học Viện.', b'0', 'ONGOING', 'Tôi Đã Giết Tuyển Thủ Học Viện', '2026-03-06 10:08:31.000000', 12324, 2, 'toi-da-giet-tuyen-thu-hoc-vien'),
(12, 'Đang cập nhật', 'https://img.otruyenapi.com/uploads/comics/song-chung-voi-dai-ty-ma-ca-rong-thumb.jpg', '2026-03-06 10:08:50.000000', '(Phúc Hắc cường thế mỹ diễm hấp huyết quỷ tỷ tỷ &gt; ngọt ngào cứng cỏi tài mê nữ sinh viên) Ngày Tống Dụ chuyển vào nhà mới, bị trong viện kỳ quái đá điêu nhảy ra từ mỹ diễm hấp huyết quỷ tỷ tỷ cắn. Veriel bị lực lượng không biết trên người Tống Dụ đánh thức, khát vọng đối với bản năng máu làm cho nàng cắn Tống Dụ, cũng dùng kim tệ hấp dẫn Tống Dụ, để Tống Dụ lưu lại làm việc cho nàng. Hai người bắt đầu cuộc sống chung không vừa mắt.', b'0', 'COMPLETED', 'Sống Chung Với Đại Tỷ Ma Cà Rồng', '2026-03-06 10:08:50.000000', 43223, 2, 'song-chung-voi-dai-ty-ma-ca-rong'),
(13, 'Đang cập nhật', 'https://img.otruyenapi.com/uploads/comics/tro-thanh-co-chau-gai-bi-khinh-miet-cua-gia-toc-vo-lam-thumb.jpg', '2026-03-06 10:09:37.000000', 'Cô xuyên không trở thành một nhân vật chính trong thế giới võ lâm. Cô trở thành BaekRi Yeon, đứa con gái ngốc nghếch và quậy phá của BaekRi Eui Kang, một người thầy chân chính và là người đã dẫn dắt nhân vật nam chính trở thành một anh hùng. Sau khi bất ngờ bị giết, cô mở mắt ra và trở thành một đứa trẻ có thể làm đảo ngược mọi thứ. ‘Mình, lần này có thể nhận được sự yêu thương không?” Ở kiếp này, cô có niềm tin rằng mình sẽ trở thành con gái được yêu thương chứ không phải đứa con gái chịu nhiều tổn thương nữa, cô bắt đầu cuộc sống được mọi người kính trọng từ cháu gái của gia đình Baekri. Những gia tộc cản trở xuất hiện trước mặt Yeon, người chỉ muốn đi trên con đường rải đẩy hoa, và Baek Ri Pae-hyeok, là tộc trưởng và cũng là ông nội của cô, ông sở hữu khí phách của một vị vua, người có thể khiến cả núi sông và cây cối rung chuyển chỉ bằng một ánh mắt. “Ngươi cho rằng ngươi đáng giá như thế sao!” “Vâng!” Ông không thể che giấu sự hốt hoảng trước khí thế mạnh mẽ của cháu gái “Nếu còn một tia hy vọng mong manh, người làm cha sao con có thể từ bỏ?” “…Như là một đứa trẻ cứng đầu.” Ông lão bắt đầu mềm lòng vì hai cha con tuyệt mỹ đánh bại với quyết tâm sẽ cứu đứa cháu gái không có tài nghệ võ công … Tôi nghĩ rằng được sống ở thời điểm này là xứng đáng, nhưng nỗi ám ảnh của các ứng cử viên nam chính đột nhiên bắt đầu? Yeoni của chúng ta, bây giờ hãy chỉ đi trên con đường hoa thôi nhé!', b'0', 'COMPLETED', 'Trở Thành Cô Cháu Gái Bị Khinh Miệt Của Gia Tộc Võ Lâm', '2026-03-06 10:09:37.000000', 3429, 2, 'tro-thanh-co-chau-gai-bi-khinh-miet-cua-gia-toc-vo-lam'),
(14, '旷盛动漫', 'https://img.otruyenapi.com/uploads/comics/nhan-mon-bat-tri-dao-thumb.jpg', '2026-03-06 10:10:02.000000', 'Có những khúc quanh trong sự bình thường, có niềm vui trong nguy hiểm, và thế giới ngoài nhận thức của con người là điều mà con người chưa biết đến. Hãy cầm điện thoại và theo chân bậc thầy bắt quái vật Chuyi và \"người mới\" Sanxian để khám phá những điều kỳ diệu chưa biết. Những bí mật chưa biết đang chờ bạn ở đây. [Liên hệ hợp tác kinh doanh QQ: 1371665284]Bởi vì toàn bộ thành phố đều là phiền toái, người già cũng rất bận rộn, bọn họ cũng rất', b'0', 'COMPLETED', 'Nhân Môn Bất Tri Đạo', '2026-03-06 10:10:02.000000', 9675, 2, 'nhan-mon-bat-tri-dao'),
(15, '', 'https://img.otruyenapi.com/uploads/comics/mot-ngay-no-toi-bong-thanh-nang-cong-chua-thumb.jpg', '2026-03-06 10:10:25.000000', 'Một ngày nọ, khi tôi mở mắt ra, tôi đã thấy mình trở thành công chúa. Tôi thật là may mắn vì ngay từ khi sinh ra đã ngậm “chiếc thìa vàng”. Nhưng sau đó, tôi đã chết trong tay của cha mình. Hoàng đế Claude – là một người máu lạnh và không có nước mắt .', b'0', 'COMPLETED', 'Một Ngày Nọ Tôi Bỗng Thành Nàng Công Chúa', '2026-03-06 10:10:25.000000', 5466, 2, 'mot-ngay-no-toi-bong-thanh-nang-cong-chua'),
(16, 'Đang cập nhật', 'https://img.otruyenapi.com/uploads/comics/dai-lao-nao-cung-tranh-sung-ta-thumb.jpg', '2026-03-06 10:10:39.000000', 'Lam Cận sau 3 năm xuyên không trở về, phát hiện thanh danh của chính mình đã bị làm cho tổn hại. Cô chẳng những có thêm 5 vị hôn phu, mà còn có thêm 5 đứa con trai của sủng mẫu cuồng ma từ tiểu thế giới xuyên tới? Bị gọi là phế vật túi rác, cô ấy vẫn dửng dưng bất động, nhưng hết lần này tới lần khác các đại lão đều tranh sủng cô ấy phải làm sao bây giờ?', b'0', 'COMPLETED', 'Đại Lão Nào Cũng Tranh Sủng Ta', '2026-03-06 10:10:39.000000', 9755, 2, 'dai-lao-nao-cung-tranh-sung-ta'),
(17, 'Đang cập nhật', 'https://img.otruyenapi.com/uploads/comics/chiec-tui-bi-mat-cua-tieu-thu-xau-xi-thumb.jpg', '2026-03-06 10:10:54.000000', '19 Giam cầm tắm máu vàng do nữ chính sở hữu! Để tồn tại, bạn phải che đi vẻ đẹp này bằng lớp trang điểm xấu xí này!! Bị chiếm hữu bởi nữ anh hùng Lila trong một nơi giam cầm thiếu thốn Chuyên gia trang điểm Yoon Seol thoát khỏi ‘Merry Bed Ending’ Cô che giấu vẻ đẹp của mình bằng lớp trang điểm xấu xí này. Mười năm sau, anh đã tránh được con đường ban đầu. Anh nhận được lời cầu hôn bất ngờ từ Công tước Lucas xấu xí… Liệu cô ấy có một kết thúc có hậu?', b'0', 'COMPLETED', 'Chiếc Túi Bí Mật Của Tiểu Thư Xấu Xí', '2026-03-06 10:10:54.000000', 435, 2, 'chiec-tui-bi-mat-cua-tieu-thu-xau-xi'),
(18, '', 'https://img.otruyenapi.com/uploads/comics/tien-hoa-vo-han-bat-dau-tu-con-so-khong-thumb.jpg', '2026-03-06 10:11:11.000000', 'Truyện tranh Tiến Hóa Vô Hạn Bắt Đầu Từ Con Số Không được cập nhật nhanh và đầy đủ nhất tại TruyenQQ. Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ TruyenQQ ra các chương mới nhất của truyện Tiến Hóa Vô Hạn Bắt Đầu Từ Con Số Không.', b'0', 'ONGOING', 'Tiến Hóa Vô Hạn Bắt Đầu Từ Con Số Không', '2026-03-06 10:11:11.000000', 978, 2, 'tien-hoa-vo-han-bat-dau-tu-con-so-khong'),
(19, 'TruyenQQ', 'https://img.otruyenapi.com/uploads/comics/tieu-thu-nho-vo-nang-muon-cuu-roi-gia-toc-thumb.jpg', '2026-03-06 10:11:23.000000', 'Tiểu Thư Nhỏ Vô Năng Muốn Cứu Rỗi Gia Tộc - Tiểu Thư Nhỏ Vô Năng Muốn Cứu Rỗi Gia Tộc', b'0', 'COMPLETED', 'Tiểu Thư Nhỏ Vô Năng Muốn Cứu Rỗi Gia Tộc', '2026-03-06 10:11:23.000000', 4566, 2, 'tieu-thu-nho-vo-nang-muon-cuu-roi-gia-toc'),
(20, 'TruyenQQ', 'https://img.otruyenapi.com/uploads/comics/thanh-guom-diet-quy-truyen-mau-thumb.jpg', '2026-03-06 10:11:35.000000', 'Thanh Gươm Diệt Quỷ (Truyện Màu) - Thanh Gươm Diệt Quỷ (truyện Màu)', b'0', 'COMPLETED', 'Thanh Gươm Diệt Quỷ (Truyện Màu)', '2026-03-06 10:11:35.000000', 67667, 2, 'thanh-guom-diet-quy-truyen-mau'),
(21, '斩魔, Mộng Tiên Giới', 'https://img.otruyenapi.com/uploads/comics/thuong-nhan-buon-lau-thoi-mat-the-ta-dung-que-cay-doi-vang-thoi-thumb.jpg', '2026-03-06 10:11:47.000000', 'Thương Nhân Buôn Lậu Thời Mạt Thế: Ta Dùng Que Cay Đổi Vàng Thỏi - ', b'0', 'COMPLETED', 'Thương Nhân Buôn Lậu Thời Mạt Thế: Ta Dùng Que Cay Đổi Vàng Thỏi', '2026-03-06 10:11:47.000000', 654, 2, 'thuong-nhan-buon-lau-thoi-mat-the-ta-dung-que-cay-doi-vang-thoi'),
(22, 'TruyenQQ', 'https://img.otruyenapi.com/uploads/comics/ke-phan-dien-ma-toi-giet-da-song-lai-thumb.jpg', '2026-03-06 10:12:00.000000', 'Kẻ Phản Diện Mà Tôi Giết Đã Sống Lại - Kẻ Phản Diện Mà Tôi Giết Đã Sống Lại', b'0', 'COMPLETED', 'Kẻ Phản Diện Mà Tôi Giết Đã Sống Lại', '2026-03-06 10:12:00.000000', 4564, 2, 'ke-phan-dien-ma-toi-giet-da-song-lai'),
(23, 'Bdcomics', 'https://img.otruyenapi.com/uploads/comics/ham-nguc-thom-mui-ga-ran-thumb.jpg', '2026-03-06 10:13:12.000000', 'Hầm Ngục Thơm Mùi Gà Rán - ', b'0', 'COMPLETED', 'Hầm Ngục Thơm Mùi Gà Rán', '2026-03-06 10:13:12.000000', 5677, 2, 'ham-nguc-thom-mui-ga-ran'),
(24, 'Bdcomics', 'https://img.otruyenapi.com/uploads/comics/cong-chua-di-hoc-thumb.jpg', '2026-03-06 10:13:59.000000', 'Công Chúa Đi Học - ', b'0', 'COMPLETED', 'Công Chúa Đi Học', '2026-03-06 10:13:59.000000', 5343, 2, 'cong-chua-di-hoc'),
(25, 'Rei', 'https://img.otruyenapi.com/uploads/comics/imouto-no-tomodachi-ga-nani-kangae-teru-no-ka-wakaranai-thumb.jpg', '2026-03-06 10:14:11.000000', 'Tập hợp các mẩu truyện ngắn 4 trang do astirt Rayrei vẽ. Câu chuyện kể về cô bé Tsuyu đã crush ông anh trai của cô bạn thân', b'1', 'COMPLETED', 'Imouto no Tomodachi ga Nani Kangae Teru no ka Wakaranai', '2026-03-12 17:37:27.000000', 534354, 2, 'imouto-no-tomodachi-ga-nani-kangae-teru-no-ka-wakaranai'),
(26, 'Bdcomics', 'https://img.otruyenapi.com/uploads/comics/chung-minh-pham-gia-thumb.jpg', '2026-03-06 10:14:27.000000', 'Chứng Minh Phẩm Giá - ', b'1', 'COMPLETED', 'Chứng Minh Phẩm Giá', '2026-03-12 17:02:00.000000', 76766, 2, 'chung-minh-pham-gia'),
(27, 'Bdcomics', 'https://img.otruyenapi.com/uploads/comics/toi-co-the-nhin-thay-tieu-de-thumb.jpg', '2026-03-06 10:19:11.000000', 'Tôi Có Thể Nhìn Thấy Tiêu Đề - ', b'1', 'COMPLETED', 'Tôi Có Thể Nhìn Thấy Tiêu Đề', '2026-03-12 16:54:37.000000', 65767, 2, 'toi-co-the-nhin-thay-tieu-de'),
(28, 'Thành Phong', 'https://img.otruyenapi.com/uploads/comics/thuan-thu-su-thien-tai-thumb.jpg', '2026-03-06 10:24:02.000000', 'Truyện tranh Thuần Thú Sư Thiên Tài được cập nhật nhanh và đầy đủ nhất tại . Bạn đọc đừng quên để lại bình luận và chia sẻ, ủng hộ ra các chương mới nhất của truyện Thuần Thú Sư Thiên Tài.', b'1', 'ONGOING', 'Thuần Thú Sư Thiên Tài', '2026-03-12 15:58:57.000000', 67656, 2, 'thuan-thu-su-thien-tai');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKkq05k829008ssio0ko984yai6` (`slug`),
  ADD KEY `FKa23e31ej0204qqy0k15i0vl21` (`creator_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `stories`
--
ALTER TABLE `stories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `FKa23e31ej0204qqy0k15i0vl21` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
