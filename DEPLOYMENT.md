# Trạng thái triển khai

Ngày 27/10/2026: mã nguồn đã được lưu trong Apps Script; Script Property REGISTRY_ID đã cấu hình riêng; manifest chỉ yêu cầu Google Sheets. Đã chọn Web App chạy dưới tài khoản chủ sở hữu và quyền truy cập Anyone. Google đang hiển thị nút **Ủy quyền truy cập**; chủ tài khoản cần tự hoàn tất bước này. Chưa có URL Web App hoạt động được xác minh. Không dùng hệ thống cho dữ liệu thực trước khi hoàn tất cấp quyền và kiểm tra end-to-end.

Dự án Apps Script có tên `HTML Apps - Shared Google Sheets API`. Script Property `REGISTRY_ID` được thiết lập riêng trong Project Settings; không đưa ID bảng riêng tư vào mã công khai.

Backend cần chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. Dữ liệu vẫn yêu cầu token theo app; bảng Google Sheets không được công khai. Quyền OAuth duy nhất trong manifest là chỉnh sửa Google Sheets.

GitHub Pages đã xuất bản từ nhánh main, thư mục docs:

- App 1: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/
- App 2: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/?app=test-notes-2

Giao diện tải được, backend chưa kết nối. `docs/config.js` để endpoint trống có chủ đích cho đến khi Google cấp quyền và trả URL `/exec`. Sau khi cấp quyền: lấy URL deployment, kiểm tra health, cập nhật endpoint, kiểm tra CRUD từ giao diện và đối chiếu hai file Sheets. Dùng lại deployment này cho các app sau.

