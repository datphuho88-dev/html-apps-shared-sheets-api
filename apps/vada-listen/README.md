# VADA Listen — Luyện nghe tiếng Trung

Ứng dụng HTML để ôn tập câu tiếng Trung đã học mỗi ngày.

## Phiên bản 1.5 (29/10/2026)
- Màn hình nghe tối giản, hiển thị Hán + Pinyin, không lặp Pinyin.
- **Giữ màn hình sáng khi nghe**: sử dụng Screen Wake Lock API; mặc định bật, chỉ giữ khi đang phát và trang hiển thị. Tự nhả khi tạm dừng/kết thúc hoặc rời tab, tự xin lại khi quay về. Tùy chọn trong Cài đặt một dòng; có thể hao pin hơn.
- Import TXT, CSV, JSON, DOCX, hoặc dán trực tiếp văn bản.
- Câu đã thuộc được lưu và có thể bỏ qua; câu khó được ưu tiên và có số lần lặp riêng.
- Tốc độ, bản dịch tiếng Việt, lặp mặc định ngay trên màn hình nghe.
- **Media Session cho điều khiển màn hình khóa** (hỗ trợ tùy thiết bị và trình duyệt):
  - Nút **bài trước (◀)**: đặt câu đang phát là **đã thuộc**, tự bỏ qua nếu bật Bỏ qua câu đã thuộc.
  - Nút **bài sau (▶)**: đặt câu đang phát là **cần học thêm**, ít nhất 5 lượt lặp trong lần học sau.
  - Media play / pause hoạt động qua trình điều khiển media nếu Chrome hỗ trợ.
  - Một âm báo xác nhận cho "Đã thuộc", hai âm báo cho "Cần học thêm".
- Có nút bật/tắt điều khiển màn hình khóa trong Cài đặt.

**Giới hạn quan trọng:** Chế độ giữ màn hình sáng không thể vượt qua thao tác bấm nút nguồn khóa thủ công; trình duyệt/hệ điều hành có thể từ chối Wake Lock (ví dụ khi tiết kiệm pin). Chrome/HTML không thể bắt nút tăng/giảm âm lượng vật lý khi khóa màn hình. Dù đã tích hợp Media Session và một audio element, Android/Chrome có thể tạm dừng Web Speech TTS khi khóa. Không cam kết phát nền liên tục; để đảm bảo cần APK Android dùng dịch vụ phát âm thanh nền hoặc phát bằng MP3/âm thanh đã tổng hợp trước.

## Quản lý chủ đề và lịch luyện nghe (v1.5)
- Xóa một chủ đề cùng các câu trong chủ đề qua nút ✕, có xác nhận trước khi xóa.
- Lịch tháng trên Trang chủ đánh dấu ngày có nghe và tổng số giây/phút ghi nhận được khi app đang phát.
- Hiển thị ngày giờ nhập bài từ trường `created` của từng câu; chủ đề lấy thời gian sớm nhất.
- Hai tùy chọn ẩn/hiện độc lập trong Cài đặt: lịch tháng và ngày giờ nhập bài.
- Lịch nghe chỉ bắt đầu từ bản v1.5; không truy hồi được thời lượng nghe từ các phiên bản cũ.
- Dữ liệu lịch nằm trong localStorage và được bao gồm trong file JSON sao lưu mới.

## Chạy app
- Online: https://vada-chinese-listen.pages.dev
- Mở `index.html` trong Chrome hỗ trợ Web Speech API.
- Trong Cài đặt bật **Giữ màn hình sáng khi nghe** để tránh màn hình tự tắt (mặc định bật). Chế độ này tăng sử dụng pin.
- Để sử dụng nút media, bật **Điều khiển khi khóa**.
- Bấm **Phát**, sau đó khóa màn hình, mở bảng điều khiển media và thử ◀ / ▶.
- Nếu không hiện bảng điều khiển media hoặc TTS dừng, bản Web chưa tương thích trên thiết bị; cân nhắc APK.

## Lưu dữ liệu
`localStorage` với khóa `vada-listen-v1`, giữ nguyên từ phiên bản cũ. Xuất JSON trước khi xóa dữ liệu Chrome hoặc đổi thiết bị.

## Files
- `index.html` — giao diện và chức năng web.
