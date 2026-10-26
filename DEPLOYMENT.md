# Trạng thái triển khai

Ngày 27/10/2026: Web App phiên bản 1 hoạt động, chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. API yêu cầu token theo app; bảng dữ liệu và Registry vẫn riêng tư. Các app Notes trước đã được kiểm tra CRUD trên giao diện GitHub Pages và đối chiếu dữ liệu bằng plugin Google Sheets.

URL Web App chung:

https://script.google.com/macros/s/AKfycbzwYFCUs_FBho0uGsdPdvvJM-dV4DIhM7Y_2n7faFsRuJj3H9T7Ijbv5cYxfmTndhyZ/exec

Dự án Apps Script tên HTML Apps - Shared Google Sheets API. Script Property REGISTRY_ID được thiết lập riêng trong Project Settings; không đưa ID bảng riêng tư vào mã công khai.

Backend cần chạy dưới tài khoản chủ sở hữu, đối tượng truy cập Anyone. Dữ liệu vẫn yêu cầu token theo app; bảng Google Sheets không được công khai.

GitHub Pages xuất bản từ nhánh main, thư mục docs:

- App 1: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/
- App 2: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/?app=test-notes-2
- Ghi chú nhanh: https://datphuho88-dev.github.io/html-apps-shared-sheets-api/?app=ghi-chu-nhanh&v=20261027b
- VADA Chinese (mã nguồn đã commit): https://datphuho88-dev.github.io/html-apps-shared-sheets-api/chinese/

VADA Chinese:
- App ID: vada-chinese, Google Sheets riêng trong thư mục ChatGPT.
- Tabs Cards và Activity; schema đã đăng ký trong Registry.
- Grants riêng với token SHA-256; token gốc chỉ nằm trong tab Access thuộc Registry riêng tư.
- Frontend tại docs/chinese/index.html và docs/chinese/app.js, dùng lại docs/api-client.js và endpoint chung.
- Tính năng: từ vựng/ngữ pháp theo bài Super Chinese, flashcard, lịch ôn lặp lại ngắt quãng, tổng kết theo ngày.
- Đã xác minh: file dữ liệu riêng tư, headers đúng schema, Apps/Grants/Access có hàng đăng ký, GitHub connector đọc lại chính xác hai file app đã commit.
- Chưa xác minh trong phiên Chat thường: truy cập Pages công khai bằng công cụ web và CRUD qua trình duyệt thực. Chưa tuyên bố kiểm thử E2E thành công.

docs/config.js đã có endpoint chung và App ID cho 4 app. VADA Chinese dùng nguyên deployment Apps Script phiên bản 1, không sửa backend.
