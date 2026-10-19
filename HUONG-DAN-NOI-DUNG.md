# Cập nhật trạm từng bước

Giao diện và nội dung đã tách riêng. Website vẫn là các file tĩnh, không cần cài hệ thống mới.

## 1. Xem và chốt giao diện

Mở `index.html` để xem trang chủ, rồi ghé Góc đọc, Lời thì thầm và Về trạm. Nhạc chỉ phát khi người đọc chủ động bật. Mười tập podcast và ba đoạn giới thiệu cũ đã được giữ lại. Các bản gốc ngay trước lần thiết kế này nằm trong `ban-cu-truoc-thiet-ke/` (chỉ để lưu, không cần tải thư mục này lên hosting).

## 2. Thay phần giới thiệu trước

Gửi nội dung giới thiệu mới trong cuộc trò chuyện để tôi đưa vào. Nếu tự sửa: mở `noi-dung.js`, tìm `about`, thay từng đoạn nằm trong dấu ngoặc kép. `author` là tên người viết mặc định. Tên ở đầu/cuối trang và lời giới thiệu ngắn trang chủ nằm trong các file HTML; khi đổi tên thương hiệu nên đổi đồng bộ các trang.

## 3. Thêm bài đầu tiên

Ông chỉ cần gửi: tiêu đề, loại bài (tản văn/truyện ngắn/nhật ký), nội dung và tên tác giả. Tôi sẽ đưa vào bố cục có sẵn. Không cần viết nhiều bài cùng lúc.

Nếu tự sửa, tìm `"posts": []` trong `noi-dung.js` và thay bằng mẫu dưới đây, sau khi đã thay toàn bộ chữ mẫu bằng bài thật:

```js
"posts": [
  {
    "id": "bai-dau-tien",
    "published": true,
    "title": "Tiêu đề bài của ông",
    "category": "Tản văn",
    "author": "Triết Vũ",
    "excerpt": "Một hoặc hai câu giới thiệu nội dung bài.",
    "paragraphs": [
      "Đoạn đầu tiên.",
      "Đoạn tiếp theo."
    ]
  }
]
```

Mỗi bài có `id` riêng, dùng chữ không dấu và dấu gạch nối. Thêm dấu phẩy giữa các bài. Đặt bài mới lên đầu danh sách để xuất hiện trước. `published: false` ẩn bài khỏi danh sách và trang đọc, nhưng KHÔNG bảo mật nội dung: file vẫn được tải về trình duyệt. Không đặt nhật ký riêng tư hoặc nội dung nhạy cảm trong file này. Bài xuất bản tự hiện ở trang chủ, Góc đọc và đường dẫn `bai-doc.html?id=bai-dau-tien`.

Dùng dấu nháy cong “…” bên trong nội dung hoặc viết `\"` nếu cần dấu nháy kép thẳng. Nội dung là văn bản thuần, không chèn HTML. Hiện chưa có bài truyện mẫu được xuất bản dưới tên ông; Góc đọc bắt đầu bằng lời ngỏ thật đã có.

## 4. Cập nhật lời nhắn và podcast

- Trong `noi-dung.js`, phần `moods` chứa lời nhắn theo từng cảm xúc, dùng được cả khi không kết nối Google Sheets.
- Kết nối Google Sheets cũ vẫn được giữ. Cột đầu tiên cần là một trong năm cảm xúc (Bình yên, Chênh vênh, Cạn kiệt, Nặng lòng, Trống trải); cột thứ hai là lời nhắn. Dòng đầu là tiêu đề. Không phân biệt viết hoa/thường. Các dòng không khớp cảm xúc được bỏ qua, không trộn vào nhóm khác. Để `quoteSheetUrl` rỗng nếu chỉ muốn dùng nội dung trong file.
- Trong `episodes`, mỗi tập có `title`, `description`, `file`. Thêm file âm thanh vào thư mục website rồi ghi đúng tên trong `file`. Giữ thông tin người đọc/nguồn tương ứng.

## 5. Đưa phiên bản mới lên web

Sau khi ông duyệt giao diện và nội dung, tải các file HTML mới, `tram.css`, `tram.js`, `noi-dung.js` và các ảnh/âm thanh được sử dụng lên cùng thư mục hosting hiện tại. Không cần tải bản sao lưu hoặc hướng dẫn này. Lần này chưa xuất bản lên mạng.

Các trang Góc thư giãn (`thu-gian.html`) và Thần số học (`numerology.html`) hiện đã được đồng bộ hoàn toàn với giao diện mới và nhạc nền của trạm. Website chưa có màn hình quản trị để nhập bài trực tiếp. Có thể bổ sung khi ông đã quen quy trình và có nhiều bài hơn. Trước mắt, gửi bài trong cuộc trò chuyện là cách cập nhật đơn giản nhất.
