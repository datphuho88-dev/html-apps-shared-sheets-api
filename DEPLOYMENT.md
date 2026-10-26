# Trạng thái triển khai

Đang chuẩn bị. Chưa có URL Web App đã xác minh. Không dùng hệ thống cho dữ liệu thực trước khi hoàn tất cấp quyền Google và kiểm tra end-to-end.

Dự án Apps Script có tên `HTML Apps - Shared Google Sheets API`. Script Property `REGISTRY_ID` được thiết lập riêng trong Project Settings; không đưa ID bảng riêng tư vào mã công khai.

Backend cần chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. Dữ liệu vẫn yêu cầu token theo app; bảng Google Sheets không được công khai. Quyền OAuth duy nhất trong manifest là chỉnh sửa Google Sheets.

GitHub Pages: nhánh main, thư mục docs. Cấu hình `docs/config.js` chỉ chứa URL Web App và App ID công khai.

