# Trạng thái triển khai

Ngày 27/10/2026: chủ tài khoản đã cấp quyền Google. Web App phiên bản 1 hoạt động, chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. API yêu cầu token theo app; bảng dữ liệu và Registry vẫn riêng tư. Đã kiểm tra CRUD trên giao diện GitHub Pages và đối chiếu dữ liệu bằng plugin Google Sheets.

URL Web App chung:

https://script.google.com/macros/s/AKfycbzwYFCUs_FBho0uGsdPdvvJM-dV4DIhM7Y_2n7faFsRuJj3H9T7Ijbv5cYxfmTndhyZ/exec

Dự án Apps Script có tên `HTML Apps - Shared Google Sheets API`. Script Property `REGISTRY_ID` được thiết lập riêng trong Project Settings; không đưa ID bảng riêng tư vào mã công khai.

Backend cần chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. Dữ liệu vẫn yêu cầu token theo app; bảng Google Sheets không được công khai. Quyền OAuth duy nhất trong manifest là chỉnh sửa Google Sheets.

GitHub Pages đã xuất bản từ nhánh main, thư mục docs:

- App 1: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/
- App 2: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/?app=test-notes-2
- Ghi chú nhanh: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/?app=ghi-chu-nhanh&v=20261027b

`docs/config.js` đã có endpoint chung và 3 App ID. App Ghi chú nhanh được thêm bằng Registry, dùng nguyên deployment phiên bản 1; không sửa hoặc triển khai lại backend. Frontend dùng tham số phiên bản cho module để tránh cấu hình cũ trong cache. Dùng lại deployment này cho các app sau.

