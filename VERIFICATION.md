# Kết quả kiểm tra

Ngày 27/10/2026: 23 kiểm tra logic backend với Google services mô phỏng đã thành công. Hệ thống hiện có 3 App ID. Registry và 3 database riêng tư, chỉ chủ sở hữu có quyền. App mới Ghi chú nhanh được thêm sau deployment phiên bản 1, không sửa/triển khai lại backend.

GitHub Pages và Web App hoạt động. Kiểm tra trình duyệt thật trên app Ghi chú nhanh; kiểm tra quyền và cô lập dữ liệu bằng HTTPS trực tiếp tới cùng endpoint. Dữ liệu được đọc đối chiếu bằng plugin Google Sheets.

| Kiểm tra thực tế | Trạng thái |
|---|---|
| Tạo ghi chú từ app HTML và đối chiếu Sheets | Thành công: tiêu đề/nội dung tự lưu, version 2 |
| Mở lại app và đọc dữ liệu đã lưu | Thành công: đóng tab, mở tab mới, nhập lại mã, đọc đúng nội dung |
| Sửa ghi chú và đối chiếu Sheets | Thành công: nội dung cập nhật, version 3 |
| Xóa ghi chú và đối chiếu Sheets | Thành công: danh sách còn 0, bản ghi có _deleted=true và version 4 |
| Hai App ID chung Web App, dữ liệu độc lập | Thành công: cùng record ID trong app 2 và app mới có tiêu đề/nội dung khác nhau trong hai file |
| Từ chối token truy cập chéo app | Thành công: UNAUTHORIZED |
| Trình duyệt GitHub Pages đọc được JSON qua CORS | Thành công: đọc và autosave qua trình duyệt Chrome |
| Sheet ngoài danh sách được cấp quyền | Thành công: FORBIDDEN |
| Client gửi Spreadsheet ID tùy ý | Thành công: BAD_REQUEST |

Ghi chú dùng để kiểm tra xóa đã được soft delete, dữ liệu kiểm tra cô lập ở app 2 cũng đã dọn bằng API. App mới có một ghi chú hướng dẫn để chủ tài khoản thử. Các kiểm tra mô phỏng backend vẫn tách riêng trong tests/backend.test.mjs, không tính chúng là kiểm tra triển khai.

