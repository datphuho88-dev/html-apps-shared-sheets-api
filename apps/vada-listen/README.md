# VADA Listen — Luyện nghe tiếng Trung

Ứng dụng HTML độc lập để ôn tập câu tiếng Trung đã học hằng ngày.

## Phiên bản

- v1.2 (29/10/2026)
- Giao diện tối giản cho điện thoại
- Chữ Hán, Pinyin, bản dịch tiếng Việt; chỉ hiển thị một lần Pinyin
- Phát theo số lần lặp mặc định, cho phép lặp riêng từng câu
- Đánh dấu câu đã thuộc để bỏ qua, đánh dấu câu khó
- Điều chỉnh tốc độ và bật/tắt dịch ngay tại màn hình nghe
- Nhập bài từ TXT, CSV, JSON, DOCX hoặc dán văn bản
- Lưu dữ liệu học bằng localStorage của trình duyệt; chưa đồng bộ tài khoản

## Chạy app

Mở `index.html` trong trình duyệt hỗ trợ Web Speech API hoặc truy cập:

https://vada-chinese-listen.pages.dev

Chất lượng và khả năng phát âm khi khóa màn hình phụ thuộc vào giọng TTS và trình duyệt trên thiết bị.

## Cấu trúc

- `index.html`: toàn bộ mã giao diện và xử lý app.

## Lưu ý

Đây là mã nguồn app, không chứa dữ liệu học cá nhân đang lưu trong trình duyệt. Sao lưu/nhập lại dữ liệu từ app nếu chuyển điện thoại hoặc xóa dữ liệu trình duyệt.
