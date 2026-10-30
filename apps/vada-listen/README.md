# VADA Listen — Luyện nghe tiếng Trung

VADA Listen là ứng dụng web một trang để nhập bài học, luyện nghe câu tiếng Trung và theo dõi thời lượng nghe hằng ngày. Ứng dụng chạy trực tiếp trong trình duyệt, không cần tài khoản; dữ liệu học được lưu cục bộ trên thiết bị.

## Phiên bản 1.8 (29/10/2026)

### Lịch luyện nghe theo ngày
- Lịch tháng trên Trang chủ hiển thị trực tiếp tổng thời gian đã nghe trong từng ô ngày, thay cho dấu chấm trạng thái.
- Chạm vào một ngày để xem tổng thời gian và danh sách các chủ đề đã nghe trong ngày đó.
- Mỗi chủ đề trong phần chi tiết có thời lượng nghe riêng, sắp xếp từ nhiều đến ít.
- Tổng thời gian của tháng được hiển thị ở đầu lịch.
- Thời gian chỉ được cộng khi ứng dụng đang phát; mỗi nhịp ghi nhận được giới hạn để tránh cộng sai sau khi tab ngủ hoặc hệ thống tạm dừng.
- Lịch nghe bắt đầu được ghi từ v1.5; không thể truy hồi thời lượng của các phiên bản cũ.
- Lịch tổng và lịch theo chủ đề được lưu trong bản sao lưu JSON.

### Nhập và quản lý bài học
- Nhập bằng cách dán văn bản hoặc chọn file **TXT, CSV, JSON, DOCX**.
- CSV hỗ trợ các cột phổ biến như `zh`/`chinese`, `pinyin`, `vi`/`vietnamese`, `topic`.
- JSON nhận mảng câu trực tiếp hoặc đối tượng sao lưu có trường `sentences`.
- DOCX được đọc trực tiếp trên thiết bị, không gửi file lên máy chủ.
- Tự nhận diện câu có chữ Hán, gộp các dòng tiếng Trung trùng nhau và có thể nhận diện bản dịch tiếng Việt trong dữ liệu văn bản.
- Gán tên chủ đề khi nhập; nếu để tên mặc định, ứng dụng lấy tên file làm chủ đề.
- Hiển thị ngày giờ nhập bài từ trường `created`; thời gian của chủ đề lấy từ câu được nhập sớm nhất.
- Có thể xóa từng câu hoặc xóa cả chủ đề. Xóa chủ đề luôn có hộp xác nhận và sẽ xóa toàn bộ câu thuộc chủ đề đó.
- Nên xuất bản sao lưu JSON trước khi xóa số lượng lớn hoặc chuyển thiết bị.

### Ẩn/hiện thông tin
- Bật/tắt độc lập lịch luyện nghe và ngày giờ nhập bài trong Cài đặt.
- Chọn chế độ hiển thị Hán + Pinyin, chỉ Hán hoặc chỉ Pinyin khi nghe.
- Có tùy chọn ẩn Pinyin trong thư viện.
- Các tùy chọn hiển thị được lưu cùng dữ liệu cục bộ và trong bản sao lưu.

### Điều khiển nghe
- Phát, tạm dừng, câu trước và câu tiếp theo.
- Điều chỉnh tốc độ đọc, thời gian nghỉ, số lần lặp mặc định và số lần lặp riêng của câu khó.
- Bật/tắt đọc bản dịch tiếng Việt.
- Đánh dấu **Đã thuộc** hoặc **Cần học thêm**; câu cần học thêm được ưu tiên và có ít nhất 5 lượt lặp trong lần học sau.
- Tùy chọn bỏ qua câu đã thuộc, trộn thứ tự và lặp lại danh sách.
- Media Session hỗ trợ play/pause và nút bài trước/bài sau trên bảng điều khiển media nếu trình duyệt/thiết bị cho phép:
  - **Bài trước (◀):** đánh dấu câu hiện tại là Đã thuộc.
  - **Bài sau (▶):** đánh dấu câu hiện tại là Cần học thêm.
  - Một âm báo xác nhận cho Đã thuộc, hai âm báo cho Cần học thêm.
- Có công tắc riêng để bật/tắt điều khiển khi khóa màn hình.

### Giữ màn hình sáng (Wake Lock)
- Screen Wake Lock được bật mặc định trong Cài đặt.
- Chỉ giữ màn hình sáng khi đang phát và tab đang hiển thị.
- Tự nhả khi tạm dừng, kết thúc hoặc rời tab; tự xin lại khi quay về và tiếp tục phát.
- Có thể tắt bất kỳ lúc nào để tiết kiệm pin.

## Giới hạn cần biết
- Dữ liệu nằm trong `localStorage` của trình duyệt với khóa `vada-listen-v1`. Xóa dữ liệu trình duyệt, dùng chế độ riêng tư, đổi trình duyệt hoặc đổi thiết bị có thể làm mất dữ liệu nếu chưa xuất JSON.
- Dung lượng thực tế phụ thuộc giới hạn `localStorage`, bộ nhớ và hiệu năng của từng trình duyệt; ứng dụng không đặt một số lượng câu cố định. File rất lớn có thể nhập chậm hoặc không lưu được.
- DOCX cần trình duyệt hỗ trợ giải nén `deflate-raw` qua `DecompressionStream`. Một số file DOCX/kiểu nén có thể không đọc được; khi đó hãy xuất nội dung sang TXT, CSV hoặc JSON.
- Web Speech TTS, giọng tiếng Trung/tiếng Việt, Media Session và Wake Lock phụ thuộc trình duyệt, hệ điều hành và thiết bị.
- Wake Lock không thể vượt qua thao tác bấm nút nguồn để khóa thủ công và có thể bị từ chối khi hệ thống tiết kiệm pin.
- Android/Chrome có thể tạm dừng Web Speech TTS khi khóa màn hình; bản web không cam kết phát nền liên tục.
- Chrome/HTML không thể dùng nút tăng/giảm âm lượng vật lý để đánh dấu câu.
- Thời lượng lịch chỉ phản ánh thời gian ứng dụng ghi nhận khi đang phát, không phải thời lượng âm thanh đã được xác minh bởi hệ điều hành.
- Nếu cần phát nền ổn định khi khóa máy, nên dùng ứng dụng Android có dịch vụ âm thanh nền hoặc dùng file âm thanh đã tổng hợp trước.

## Sao lưu và khôi phục
- Trong Cài đặt, chọn **Sao lưu dữ liệu JSON** trước khi xóa dữ liệu trình duyệt hoặc đổi thiết bị.
- Bản sao lưu gồm câu học, cài đặt, tổng thời gian theo ngày và thời gian theo từng chủ đề.
- Import JSON sẽ thêm/gộp bài học; không tự động xóa dữ liệu đang có.

## Chạy ứng dụng
- Cloudflare Pages: https://vada-chinese-listen.pages.dev
- Mã nguồn: https://github.com/datphuho88-dev/html-apps-shared-sheets-api/tree/main/apps/vada-listen
- Hoặc mở `index.html` trong Chrome/Edge có Web Speech API.

## Cấu trúc
- `index.html` — toàn bộ giao diện và chức năng ứng dụng.
- `manifest.webmanifest` — cấu hình cài đặt dạng PWA.
- `icon.svg` — biểu tượng ứng dụng.
- `README.md` — ghi chú tính năng và giới hạn của phiên bản hiện tại.

## Nguyên tắc dữ liệu
Bản v1.8 tiếp tục dùng khóa `vada-listen-v1` và giữ tương thích với dữ liệu cũ. Việc cập nhật hoặc triển khai mã không đọc, thay đổi hay xóa dữ liệu học đang lưu trên thiết bị của người dùng.


## Giọng đọc AI (cập nhật 30/10/2026)

- Trong Cài đặt có **Giọng đọc → Android / AI tự nhiên**, và tùy chỉnh khoảng nghỉ tại dấu phẩy.
- Có tích hợp máy khách gọi `POST /api/tts` và kiểm tra trạng thái qua `GET /api/tts-status`.
- Backend đang triển khai trên Cloudflare Pages Functions Worker, dùng Azure Speech Neural Voice: `zh-CN-XiaoxiaoNeural` và `vi-VN-HoaiMyNeural`, SSML để kiểm soát ngắt nghỉ.
- **Chưa hoạt động AI** nếu chưa gắn hai environment secret `AZURE_SPEECH_KEY` và `AZURE_SPEECH_REGION` trên Cloudflare Pages production. Không ghi khóa vào GitHub, HTML hoặc localStorage.
- Khi không cấu hình hoặc giọng AI lỗi, tự dùng TTS Android. TTS Android phụ thuộc máy và không được đảm bảo ngắt nghỉ chính xác như Azure.
- API cần internet và có thể phát sinh phí Azure. Khi triển khai công khai nên bổ sung bảo vệ quota / rate limit tại Cloudflare.
- Dữ liệu câu đã học giữ nguyên ở trình duyệt qua khóa localStorage cũ.
