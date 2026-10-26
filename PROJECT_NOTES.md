# Ghi chú dự án: tạo app HTML và Google Sheets bằng kết nối dùng chung

## Cách làm việc đã thống nhất

Khi tôi yêu cầu tạo app HTML mới và Google Trang tính mới, hãy mặc định dùng hệ thống Google Sheets API chung đã thiết lập. Tôi chỉ cung cấp yêu cầu chức năng và giao diện; bạn chủ động triển khai toàn bộ rồi trả link kết quả. Không yêu cầu tôi thiết lập lại Apps Script, tự tạo bảng, tự đăng ký App ID, tự chép mã hoặc tự triển khai GitHub Pages.

Repository tham chiếu: https://github.com/datphuho88-dev/html-apps-shared-sheets-api

Đọc `NEW_APP.md`, `DEPLOYMENT.md` và `docs/config.js` trong repository trước khi thực hiện. Lấy URL Web App chung hiện hành từ `docs/config.js`; không yêu cầu tôi cung cấp lại khi có thể đọc bằng công cụ đã kết nối.

## Hệ thống đã có sẵn

- Một dự án Apps Script: **HTML Apps - Shared Google Sheets API**.
- Một Registry riêng tư: **HTML Apps - Database Registry**, tìm bằng Google Drive và xác minh đúng chủ tài khoản.
- Một Web App chung đang hoạt động, có CRUD, phân quyền theo App ID/grant/sheet và dữ liệu riêng của từng app.
- Mẫu tích hợp HTML/JavaScript, app ghi chú, quy trình đăng ký và kiểm tra đã có trong repository.
- Kết nối thực tế đã được kiểm tra tạo, đọc, sửa, xóa, đóng/mở lại, tách dữ liệu giữa app và từ chối truy cập chéo.

Không tạo một Apps Script, Registry hoặc deployment riêng cho mỗi app mới. Mỗi app có **Google Sheets riêng + App ID riêng + quyền truy cập riêng**, dùng lại cùng endpoint Web App.

## Công việc bạn tự thực hiện cho mỗi app mới

1. Đọc yêu cầu, tự chọn các chi tiết triển khai hợp lý; chỉ hỏi khi thiếu thông tin thực sự bắt buộc.
2. Kiểm tra hệ thống chung còn hoạt động và xác định đúng Registry. Nếu gặp lỗi, tìm nguyên nhân và sửa trong phạm vi đã được cho phép; không dựng hệ thống trùng lặp để né lỗi.
3. Tạo Google Sheets mới, các sheet con và cột phù hợp. Giữ file riêng tư; không dùng Registry làm nơi chứa toàn bộ dữ liệu app.
4. Đăng ký App ID mới trong Registry, liên kết đúng Spreadsheet ID, schema và quyền. Sinh mã truy cập bằng bộ sinh mật mã, lưu hash và cấp quyền riêng; không yêu cầu tôi tự làm.
5. Tạo giao diện HTML theo yêu cầu, dùng Web App chung và App ID mới. Không nhúng mã bí mật hoặc khóa quản trị vào HTML, GitHub, URL hay báo cáo. Việc dùng app vẫn tuân theo cơ chế đăng nhập/mã truy cập; không biến app thành truy cập công khai chỉ để bỏ bước xác thực.
6. Triển khai bằng GitHub đã kết nối, xuất bản GitHub Pages, xử lý cache tài nguyên và kiểm tra giao diện trên điện thoại.
7. Kiểm tra **thực tế qua app**: tạo, đối chiếu Sheets, mở lại, sửa, xóa; kiểm tra dữ liệu độc lập và token không dùng chéo app. Không coi unit test hoặc dòng dữ liệu chèn trực tiếp là bằng chứng app hoạt động.
8. Cập nhật Registry và tài liệu, trả link app, link Google Sheets, link mã nguồn và kết quả kiểm tra ngắn gọn. Chỉ báo hoàn thành khi đã xác minh; nêu chính xác phần chưa làm được nếu có.

Các schema chuỗi/chức năng đã hỗ trợ chỉ cần đăng ký cấu hình, không sửa hay triển khai lại backend. Nếu chức năng mới cần nâng cấp backend, tự chuẩn bị, kiểm tra và cập nhật **deployment hiện có**, giữ nguyên URL chung khi nền tảng cho phép; không bắt tôi thiết lập lại hệ thống từ đầu.

## Khi nào cần tôi can thiệp

Chỉ dừng khi cần chủ tài khoản đăng nhập, cấp lại quyền, xác nhận bảo mật, phê duyệt hành động nhạy cảm hoặc bổ sung thông tin bắt buộc mà công cụ không thể tìm được. Dừng đúng bước, nói rõ thao tác cần làm và tiếp tục sau khi tôi hoàn tất. Không hỏi lại các bước tạo file, cấu hình, triển khai và kiểm thử thông thường đã được giao.

## Câu yêu cầu mẫu

“Tạo app HTML [mô tả chức năng/giao diện], tự tạo Google Sheets mới và dùng kết nối chung đã có. Tự triển khai, kiểm tra rồi gửi tôi link kết quả.”

## Sử dụng ở dự án hoặc cuộc trò chuyện khác

Gắn ghi chú này hoặc repository tham chiếu vào ngữ cảnh/hướng dẫn của dự án để trợ lý mới đọc được. Không giả định một cuộc trò chuyện không có ngữ cảnh sẽ tự nhớ cấu hình từ cuộc trò chuyện trước. Đây là việc cung cấp ngữ cảnh, không phải thiết lập lại Google Apps Script. Khi đã có ghi chú trong dự án, các yêu cầu tiếp theo chỉ cần mô tả app.

