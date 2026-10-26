# HTML Apps - Shared Google Sheets API

Một Apps Script Web App phục vụ nhiều app HTML trên GitHub Pages. Mỗi app có file Google Sheets độc lập, schema và quyền riêng. Thêm app bằng bảng Registry; không sửa backend hoặc tạo deployment mới.

## Tài nguyên của hệ thống

Tìm bảng riêng tư bằng Google Drive với tên chính xác `HTML Apps - Database Registry`. Liên kết database từng app nằm trong tab Apps. Tìm dự án Apps Script với tên `HTML Apps - Shared Google Sheets API`. ID các tài nguyên riêng tư không đưa vào repository công khai.

URL Web App: đang chờ chủ tài khoản cấp quyền Google; xem DEPLOYMENT.md. Giao diện đã xuất bản tại https://datphuho88-dev.github.io/html-apps-shared-sheets-api/ nhưng chưa kết nối dữ liệu.

## Thư mục

- `backend/Code.gs`: backend dùng chung. Script Property `REGISTRY_ID` chỉ thiết lập một lần trong cài đặt Apps Script.
- `backend/appsscript.json`: manifest với quyền Google Sheets.
- `docs/`: Test Notes App và SDK tích hợp. GitHub Pages dùng nhánh `main`, thư mục `/docs`.
- `NEW_APP.md`: quy trình dùng lại cho các cuộc trò chuyện sau.
- `tests/backend.test.mjs`: kiểm tra logic với dịch vụ Google mô phỏng. Chạy `node tests/backend.test.mjs`.
- `VERIFICATION.md`: phân biệt rõ kiểm tra cục bộ với kiểm tra triển khai thực tế.

## Xác thực và phân quyền

App ID không phải mật khẩu. Người dùng nhập token ngẫu nhiên 256 bit, cấp riêng theo app. Frontend chỉ giữ token trong `sessionStorage`, không có token trong URL, mã HTML hay GitHub. Token gửi bằng HTTPS POST body; không ghi log.

Tab `Grants` lưu SHA-256 của token, App ID, grantId, thao tác, sheet, hạn dùng và phạm vi. `scope=own` chỉ cho phép truy cập bản ghi có `_owner=grantId`; `scope=app` cho phép truy cập toàn bộ dữ liệu của app. Thu hồi bằng `status=revoked` hoặc đổi tokenHash. Token không thể đăng ký app hay chọn Spreadsheet ID.

Tab `Access` giữ bản sao token để chủ tài khoản lấy mã ban đầu. Cột B được ẩn để giảm lộ mã khi xem bảng; chủ tài khoản có thể hiện lại cột để lấy mã. Đây là dữ liệu bí mật trong **bảng Registry riêng tư**, chỉ chủ tài khoản có quyền. Ẩn cột không thay thế quyền chia sẻ riêng tư. Có thể xóa ô token sau khi cất vào trình quản lý mật khẩu; API chỉ cần tokenHash trong Grants. Không chia sẻ Registry. Token cấp ban đầu hết hạn ngày 27/10/2027 UTC; có thể đổi hạn trong Grants. Ai giữ token có quyền tương ứng, nên cấp mỗi người một grant riêng.

Chỉ chủ sở hữu/biên tập viên Registry được thêm, sửa hoặc thu hồi cấu hình qua Google Sheets hoặc plugin đã kết nối. API công khai chỉ hỗ trợ CRUD dữ liệu; không có endpoint quản trị. Các helper Apps Script có hậu tố `_`, không gọi được qua `google.script.run`.

## Giao thức

`GET /exec` trả trạng thái dịch vụ, không chứa dữ liệu riêng. Mọi đọc/ghi dùng `POST /exec` với `Content-Type: text/plain;charset=utf-8` và JSON body, để tránh CORS preflight không được Apps Script hỗ trợ. ContentService chuyển hướng sang googleusercontent.com; client phải theo chuyển hướng. Chỉ báo thành công khi đọc và xác thực JSON trả về. Không dùng `mode:no-cors` vì không đọc được kết quả.

Ví dụ cấu trúc (token nhập lúc chạy, không đưa vào mã nguồn):

```js
const api = new SheetsApi({endpoint: WEB_APP_URL, appId: APP_ID, token: userEnteredToken});
const {record} = await api.create('Notes', crypto.randomUUID(), {title:'Tiêu đề',body:'Nội dung'});
await api.update('Notes', record.id, record.version, {body:'Đã sửa'});
await api.remove('Notes', record.id, record.version + 1);
const notes = await api.list('Notes');
```

Responses có `ok`, `status`, `requestId`, `data` hoặc `error:{code,message}`. Apps Script ContentService không tùy chỉnh HTTP status; kiểm tra `ok/status` trong JSON. Lỗi có mã `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT`, `CAPACITY`, `BUSY`, `CONFIG_ERROR`, `INTERNAL`.

CRUD sử dụng ID ổn định do client sinh, phiên bản tăng dần, ScriptLock chống ghi đồng thời và soft delete `_deleted=true`. Tạo/xóa và cập nhật liền trước có thể gửi lại an toàn. Không tự động ghi đè khi phiên bản cũ. Dữ liệu người dùng được ghi như văn bản, không thực thi công thức; giao diện hiển thị bằng textContent.

## Giới hạn vận hành

Thiết kế cho app cá nhân/nhóm nhỏ: mặc định tối đa 5.000 dòng mỗi sheet (bao gồm dòng đã xóa), trang đọc 100 bản ghi, chuỗi tối đa 20.000 ký tự/trường và payload tối đa 30.000 ký tự. Schema hiện hỗ trợ các trường chuỗi. App mới có thể thêm bao nhiêu cột đã đăng ký tùy giới hạn 40 trường; kiểu dữ liệu mới cần nâng cấp backend.

Giới hạn 60 yêu cầu/phút/grant dùng CacheService và ScriptLock. Cache có thể bị Google thu hồi sớm, nên đây là giảm tải theo mức cố gắng, không thay thế bảo vệ DDoS. Các app chia sẻ quota Google và khóa ghi; một Web App công khai vẫn có thể bị lạm dụng quota ngay cả khi không có token hợp lệ. Không dùng cho quy mô lớn hoặc dữ liệu cần cam kết dịch vụ. Sao lưu định kỳ; giữ lịch sử phiên bản Sheets; lọc `_deleted=false` khi xem dữ liệu.

Tài liệu chính thức: [Web Apps](https://developers.google.com/apps-script/guides/web), [Content Service](https://developers.google.com/apps-script/guides/content), [Quotas](https://developers.google.com/apps-script/guides/services/quotas). Không giả định quota là cố định.

