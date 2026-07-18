# Checklist kiểm tra tiến độ dự án Clinic Management System

Ngày rà soát: 13/07/2026  
Nguồn đối chiếu: sơ đồ use case do người dùng gửi, `Diagram/Use-case.puml`, code FE trong `FE/src`, code BE trong `Backend/app/src/main/java/cms/app`.

## Quy ước đánh dấu

- `[x]` Đã có màn hình FE và API/logic BE tương ứng.
- `[~]` Đã có một phần, cần kiểm thử end-to-end hoặc bổ sung chi tiết.
- `[ ]` Chưa thấy chức năng rõ ràng trong code hiện tại.

> Ghi chú: file `Diagram/Use-case.puml` trong repo đang hiển thị lỗi encoding tiếng Việt khi đọc bằng PowerShell. Nên lưu lại file này dưới UTF-8 để sơ đồ không bị lỗi chữ.

## Tổng quan tiến độ theo use case

| Mã | Use case | Actor | FE | BE | Kết nối API | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| UC1 | Nhắc lịch uống thuốc | Bệnh nhân | `MedicationReminderPage.jsx` | `MedicationReminderController`, `MedicationReminderService`, `ReminderScheduler`, `EmailService`, `SmsService` | Có | [x] |
| UC2 | Thông báo lịch hẹn khám, nhắc lịch tái khám | Bệnh nhân | `AppointmentNotificationsPage.jsx` | `FollowUpReminderController`, `FollowUpReminderService`, `FollowUpReminderScheduler` | Có | [x] |
| UC3 | Theo dõi sức khỏe | Bệnh nhân | `HealthTrackingPage.jsx` | `HealthMetricController`, `HealthMetricService` | Có | [x] |
| UC4 | Thanh toán viện phí | Bệnh nhân | `BillingPage.jsx` | `InvoiceController`, `InvoiceService` | Có | [x] |
| UC5 | Lịch sử đặt khám | Bệnh nhân | `AppointmentHistoryPage.jsx` | `AppointmentHistoryController`, `AppointmentHistoryService` | Có | [x] |
| UC6 | Đặt lịch khám | Bệnh nhân | `AppointmentPage.jsx` | `AppointmentController`, `AppointmentService`, `CatalogController` | Có | [x] |
| UC7 | Hồ sơ sức khỏe | Bệnh nhân | `HealthProfilePage.jsx`, `UserProfilePage.jsx`, `MedicalHistory.jsx`, `PrescriptionsPage.jsx`, `TestResultsPage.jsx` | `HealthProfileController`, `MedicalRecordController`, `PrescriptionController`, `ServiceRequestController` | Có | [x] |
| UC8 | Đăng ký/Đăng nhập | Bệnh nhân, Bác sĩ | `Register.jsx`, `Login.jsx` | `AuthController`, `AuthService`, `JwtService`, `SecurityConfig` | Có | [x] |
| UC9 | Cập nhật bệnh án/Chẩn đoán | Bác sĩ | `DoctorMedicalRecordsPage.jsx` | `MedicalRecordController`, `MedicalRecordService` | Có | [x] |
| UC10 | Chỉ định cận lâm sàng | Bác sĩ | `DoctorServiceRequestsPage.jsx`, `TestResultsPage.jsx` | `ServiceRequestController`, `ServiceRequestService`, `CatalogService` | Có | [x] |
| UC11 | Kê đơn thuốc | Bác sĩ | `DoctorPrescriptionsPage.jsx`, `PrescriptionsPage.jsx` | `PrescriptionController`, `PrescriptionService` | Có | [x] |
| UC12 | Báo cáo doanh thu | Quản trị viên | `AdminRevenuePage.jsx` | `RevenueReportController`, `RevenueReportService` | Có | [x] |
| UC13 | Quản lý tài khoản người dùng | Quản trị viên | `AdminUsersPage.jsx`, `AdminStaffPage.jsx` | `UserManagementController`, `UserService`, `AuthController`, `DoctorController` | Có | [x] |
| UC14 | Giám sát hệ thống | Quản trị viên | `AdminSystemMonitorPage.jsx` | `SystemMonitorController`, `SystemMonitorService` | Có | [x] |

## Checklist chi tiết

### UC1 - Nhắc lịch uống thuốc

- [x] FE có trang quản lý nhắc thuốc: `FE/src/pages/MedicationReminderPage.jsx`.
- [x] FE có API lấy danh sách, tạo, bật/tắt và xóa nhắc thuốc: `getActiveReminders`, `createReminder`, `toggleReminder`, `deleteReminder`.
- [x] BE có endpoint `/api/reminders/medication`.
- [x] BE có service gửi nhắc thuốc đến hạn qua scheduler.
- [~] Cần test thủ công cấu hình gửi email/SMS thật vì phụ thuộc biến môi trường và tài khoản dịch vụ ngoài.

### UC2 - Thông báo lịch hẹn khám, nhắc lịch tái khám

- [x] FE có trang thông báo lịch hẹn/tái khám: `FE/src/pages/AppointmentNotificationsPage.jsx`.
- [x] FE gọi API `getMyFollowUpReminders(daysAhead)`.
- [x] BE có endpoint `/api/reminders/follow-up/me`.
- [x] BE có `FollowUpReminderService` và `FollowUpReminderScheduler`.
- [~] Cần test dữ liệu thực tế: lịch đã hoàn thành, ngày tái khám trong khoảng lọc, trạng thái thông báo hiển thị đúng.

### UC3 - Theo dõi sức khỏe

- [x] FE có trang theo dõi chỉ số sức khỏe: `FE/src/pages/HealthTrackingPage.jsx`.
- [x] FE có API ghi nhận, xem lịch sử, xem tổng quan và xóa chỉ số: `recordHealthMetric`, `getMyHealthMetrics`, `getHealthMetricSummary`, `deleteHealthMetric`.
- [x] BE có endpoint `/api/health-metrics`.
- [x] BE có phân quyền cho bệnh nhân, bác sĩ và admin.
- [~] Cần test nhập dữ liệu biên: huyết áp, nhịp tim, cân nặng, đường huyết, ngày đo không hợp lệ.

### UC4 - Thanh toán viện phí

- [x] FE có trang viện phí/thanh toán: `FE/src/pages/BillingPage.jsx`.
- [x] FE có API xem hóa đơn, xem chi tiết và thanh toán: `getMyInvoices`, `getInvoiceById`, `payInvoice`.
- [x] BE có endpoint `/api/invoices/me`, `/api/invoices/{id}`, `/api/invoices/{id}/pay`.
- [x] Admin có thể tạo hóa đơn và xác nhận thanh toán tiền mặt.
- [~] Nếu yêu cầu thanh toán online thật, hiện tại cần kiểm tra thêm cổng thanh toán; code đang phù hợp cho luồng thanh toán nội bộ/demo.

### UC5 - Lịch sử đặt khám

- [x] FE có trang lịch sử đặt khám: `FE/src/pages/AppointmentHistoryPage.jsx`.
- [x] FE có API `getAppointmentHistory(patientId, filter)`.
- [x] BE có endpoint `/api/appointments/history/patient/{patientId}`.
- [x] BE có lọc theo trạng thái và khoảng ngày.
- [~] Cần test quyền truy cập để bệnh nhân không xem nhầm lịch sử của bệnh nhân khác.

### UC6 - Đặt lịch khám

- [x] FE có trang đặt lịch khám: `FE/src/pages/AppointmentPage.jsx`.
- [x] FE có chọn chuyên khoa, bác sĩ, khung giờ và gửi lịch hẹn.
- [x] FE có API `bookAppointment`, `getSpecialties`, `getDoctorsBySpecialty`, `getTimeSlots`.
- [x] BE có endpoint `/api/appointments`, `/api/catalog/specialties`, `/api/catalog/doctors`, `/api/catalog/time-slots`.
- [~] Cần test chống đặt trùng lịch và xử lý slot đã bị người khác đặt.

### UC7 - Hồ sơ sức khỏe

- [x] FE có trang hồ sơ sức khỏe tổng hợp: `FE/src/pages/HealthProfilePage.jsx`.
- [x] FE có trang thông tin cá nhân: `FE/src/pages/UserProfilePage.jsx`.
- [x] FE có trang bệnh sử, đơn thuốc và kết quả cận lâm sàng cho bệnh nhân.
- [x] BE có endpoint `/api/health-profile/me`.
- [x] BE cho phép bệnh nhân xem bệnh án qua `/api/medical-records/patient/{patientId}`.
- [x] Quan hệ include từ UC9 sang UC7 đã có hướng xử lý: bệnh án bác sĩ cập nhật có thể được bệnh nhân xem trong hồ sơ.
- [~] Cần test màn hình hồ sơ với bệnh nhân mới chưa có bệnh án/đơn thuốc/kết quả.

### UC8 - Đăng ký/Đăng nhập

- [x] FE có trang đăng ký và đăng nhập: `FE/src/pages/Register.jsx`, `FE/src/pages/Login.jsx`.
- [x] FE lưu token và thông tin user để điều hướng theo role.
- [x] BE có endpoint `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`.
- [x] BE có JWT, refresh token, kiểm tra trạng thái tài khoản.
- [x] Admin có endpoint tạo tài khoản nhân viên/bác sĩ.
- [~] Cần test đủ 3 role: PATIENT, DOCTOR, ADMIN và trường hợp tài khoản bị khóa.

### UC9 - Cập nhật bệnh án/Chẩn đoán

- [x] FE có trang bệnh án cho bác sĩ: `FE/src/pages/doctor/DoctorMedicalRecordsPage.jsx`.
- [x] FE có API tạo và cập nhật bệnh án: `createMedicalRecord`, `updateMedicalRecord`.
- [x] BE có endpoint `POST /api/medical-records` và `PUT /api/medical-records/{recordId}`.
- [x] BE kiểm tra bác sĩ sở hữu bệnh án khi cập nhật.
- [x] Dữ liệu bệnh án liên kết với UC7 để bệnh nhân xem lại hồ sơ sức khỏe.
- [~] Cần test sửa chẩn đoán sau khi đã có đơn thuốc/cận lâm sàng để tránh mất liên kết.

### UC10 - Chỉ định cận lâm sàng

- [x] FE có trang chỉ định cận lâm sàng cho bác sĩ: `FE/src/pages/doctor/DoctorServiceRequestsPage.jsx`.
- [x] FE có trang bệnh nhân xem kết quả: `FE/src/pages/TestResultsPage.jsx`.
- [x] FE dùng API `getClinicalServices`, `createServiceRequests`, `getServiceRequestsByRecord`, `getServiceRequestsByStatus`, `cancelServiceRequest`.
- [x] BE có endpoint `/api/service-requests`.
- [x] BE có danh mục dịch vụ cận lâm sàng riêng qua `CatalogService.getExamServices()`.
- [x] Danh mục đặt lịch khám và danh mục chỉ định cận lâm sàng đã được tách mục đích.
- [~] Cần test vòng đời phiếu: tạo phiếu, xem theo bệnh án, cập nhật kết quả, hủy phiếu.

### UC11 - Kê đơn thuốc

- [x] FE có trang kê đơn cho bác sĩ: `FE/src/pages/doctor/DoctorPrescriptionsPage.jsx`.
- [x] FE có trang bệnh nhân xem đơn thuốc: `FE/src/pages/PrescriptionsPage.jsx`.
- [x] FE có API `createPrescription`, `getMyPrescriptions`.
- [x] BE có endpoint `/api/prescriptions`.
- [x] BE liên kết đơn thuốc với bệnh án.
- [~] Cần test đơn thuốc nhiều dòng, liều dùng thiếu dữ liệu và xóa đơn thuốc.

### UC12 - Báo cáo doanh thu

- [x] FE có trang tổng quan doanh thu admin: `FE/src/pages/admin/AdminRevenuePage.jsx`.
- [x] FE có API `getRevenue(period)`.
- [x] BE có endpoint `/api/reports/revenue/day`, `/week`, `/month`, `/year`, `/range`.
- [x] BE có tổng hợp theo ngày, tuần, tháng, năm và khoảng ngày.
- [x] BE đã có test `RevenueReportServiceTest.java`.
- [~] Cần test số liệu khớp hóa đơn đã thanh toán và không tính hóa đơn chưa thanh toán.

### UC13 - Quản lý tài khoản người dùng

- [x] FE có trang quản lý tài khoản: `FE/src/pages/admin/AdminUsersPage.jsx`.
- [x] FE có trang quản lý bác sĩ/nhân sự: `FE/src/pages/admin/AdminStaffPage.jsx`.
- [x] FE có API `getAdminUserAccounts`, `toggleAdminUserStatus`, `createStaff`, `updateDoctor`, `toggleDoctorStatus`, `deleteDoctor`.
- [x] BE có endpoint `/api/admin/users`.
- [x] BE có endpoint `/api/auth/create-staff` cho admin tạo nhân viên.
- [x] BE có endpoint `/api/doctors` để admin quản lý bác sĩ.
- [~] Cần test admin không tự khóa chính mình và trạng thái khóa có chặn đăng nhập thật.

### UC14 - Giám sát hệ thống

- [x] FE có trang giám sát hệ thống: `FE/src/pages/admin/AdminSystemMonitorPage.jsx`.
- [x] FE có API `getSystemMonitorSnapshot`.
- [x] BE có endpoint `/api/admin/system-monitor`.
- [x] BE tổng hợp snapshot từ user, lịch hẹn, hóa đơn, nhắc thuốc, bệnh án, đơn thuốc, chỉ định và health metrics.
- [~] Cần test dữ liệu khi hệ thống rỗng và khi có nhiều bản ghi lớn.

## Checklist kiểm thử theo luồng nghiệp vụ

- [ ] Bệnh nhân đăng ký tài khoản mới.
- [ ] Bệnh nhân đăng nhập, vào dashboard và thấy menu đúng role.
- [ ] Bệnh nhân cập nhật hồ sơ sức khỏe cá nhân.
- [ ] Bệnh nhân đặt lịch khám theo chuyên khoa, bác sĩ, ngày và khung giờ.
- [ ] Bệnh nhân xem lịch sử đặt khám và hủy lịch khi còn hợp lệ.
- [ ] Admin xem danh sách lịch hẹn và cập nhật trạng thái lịch hẹn.
- [ ] Bác sĩ đăng nhập và xem lịch khám của mình.
- [ ] Bác sĩ tạo/cập nhật bệnh án và chẩn đoán cho bệnh nhân.
- [ ] Bác sĩ kê đơn thuốc từ bệnh án.
- [ ] Bác sĩ tạo phiếu chỉ định cận lâm sàng từ bệnh án.
- [ ] Bác sĩ hoặc admin cập nhật kết quả cận lâm sàng.
- [ ] Bệnh nhân xem hồ sơ sức khỏe, bệnh án, đơn thuốc và kết quả cận lâm sàng.
- [ ] Bệnh nhân tạo nhắc lịch uống thuốc và nhận nhắc khi đến giờ.
- [ ] Bệnh nhân xem thông báo tái khám.
- [ ] Admin tạo hóa đơn viện phí.
- [ ] Bệnh nhân thanh toán hóa đơn.
- [ ] Admin xác nhận thanh toán tiền mặt nếu có.
- [ ] Admin xem báo cáo doanh thu đúng theo hóa đơn đã thanh toán.
- [ ] Admin quản lý tài khoản người dùng: khóa/mở khóa.
- [ ] Admin xem trang giám sát hệ thống.

## Checklist kỹ thuật cần chạy trước khi báo hoàn thành

- [x] FE chạy `npm run build` thành công.
- [x] FE chạy `npm run lint` không có lỗi nghiêm trọng.
- [x] BE chạy `mvn test` hoặc ít nhất `mvn -DskipTests compile` thành công.
- [ ] Kiểm tra đăng nhập đủ role PATIENT, DOCTOR, ADMIN.
- [ ] Kiểm tra CORS/API base URL đúng môi trường đang chạy.
- [ ] Không commit file cấu hình thật chứa mật khẩu/token; chỉ commit `application.properties.example`.
- [ ] Kiểm tra lại `.gitignore` để loại `application.properties`, `target`, `node_modules`, `dist`.

## Test tự động đang có

- [x] `AppApplicationTests.java`
- [x] `AppointmentHistoryServiceTest.java`
- [x] `FollowUpReminderServiceTest.java`
- [x] `HealthProfileServiceTest.java`
- [x] `PasswordValidationTest.java`
- [x] `RevenueReportServiceTest.java`
- [x] `UserDetailsServiceImplTest.java`
- [~] Chưa thấy test tự động FE trong cấu trúc hiện tại.
- [~] Nên bổ sung test cho UC9, UC10, UC13, UC14 vì đây là các luồng nhiều quyền và dễ sai dữ liệu.

## Kết luận rà soát

Theo code hiện tại, 14/14 use case trong sơ đồ đã có phần triển khai chính ở cả FE và BE. Trạng thái phù hợp để chuyển sang giai đoạn test end-to-end theo checklist nghiệp vụ ở trên. Các điểm cần chú ý nhất là kiểm thử quyền truy cập theo role, luồng dữ liệu xuyên suốt bệnh án - đơn thuốc - cận lâm sàng - hồ sơ sức khỏe, cấu hình nhắc lịch thật qua email/SMS và bảo mật file cấu hình môi trường.
## Kết quả kiểm thử ngày 13/07/2026

### Kết quả tự động

- [x] Backend `mvn test`: BUILD SUCCESS, 45 tests pass, 0 failures, 0 errors.
- [x] Frontend `npm run build`: build thành công.
- [x] Frontend `npm run lint`: 0 errors, còn 7 warnings về React Hook dependency.
- [~] FE build còn cảnh báo bundle JavaScript lớn hơn 500 kB. Không làm hỏng chức năng, nhưng nên tách code/chunk nếu cần tối ưu tải trang.

### Lỗi logic đã sửa trong lần kiểm thử này

- [x] Backend `AuthResponse` đã trả thêm `patientId` và `doctorId` để FE không phải đoán profile ID từ `userId`.
- [x] Backend `AuthService` đã gắn `patientId`/`doctorId` khi đăng nhập, refresh token và tạo tài khoản nhân sự.
- [x] FE `mapAuthResponse` đã lưu `patientId`/`doctorId` vào localStorage.
- [x] FE `Login.jsx` đã bổ sung fallback lấy hồ sơ bệnh nhân/bác sĩ nếu backend cũ chưa trả profile ID.
- [x] FE `App.jsx` đã có route guard cho trang admin, doctor và billing để người dùng không truy cập nhầm role qua URL trực tiếp.

### Đánh giá logic theo nhóm chức năng

- [x] Đăng ký/đăng nhập: chạy được qua test backend và đã sửa dữ liệu role/profile ID cho FE.
- [x] Đặt lịch/lịch sử/thông báo tái khám: có đủ FE/BE và test backend cho lịch sử, nhắc tái khám.
- [x] Theo dõi sức khỏe/hồ sơ sức khỏe: có đủ FE/BE và test backend cho health profile.
- [x] Thanh toán/doanh thu: có đủ FE/BE và test backend cho báo cáo doanh thu.
- [x] Bệnh án/kê đơn/chỉ định cận lâm sàng: có đủ FE/BE, FE build pass sau khi sửa auth ID.
- [x] Quản lý tài khoản/giám sát hệ thống: có đủ FE/BE, route admin đã được khóa đúng role ở FE.

### Rủi ro còn lại cần test thủ công hoặc siết thêm

- [ ] Chưa có test tự động FE/Playwright, nên chưa thể khẳng định UI không lỗi ở mọi thao tác click/form.
- [ ] `AppointmentHistoryController` đang comment phần `@PreAuthorize` cho API xem lịch sử theo bệnh nhân/bác sĩ; backend vẫn yêu cầu đăng nhập, nhưng chưa siết quyền đúng chủ sở hữu ở 2 endpoint này.
- [ ] `AppointmentController` đặt/hủy lịch hiện chưa siết quyền chủ sở hữu theo `patientId`; nên bổ sung kiểm tra bệnh nhân chỉ đặt/hủy lịch của mình, admin/bác sĩ theo vai trò rõ ràng.
- [ ] `MedicationReminderController` cho PATIENT truyền `patientId`/`reminderId`, nhưng chưa thấy kiểm tra ownership theo bệnh nhân đang đăng nhập ở controller.
- [ ] Một số API xem chi tiết theo ID như đơn thuốc/chỉ định cận lâm sàng cho phép nhiều role truy cập; cần test hoặc bổ sung service-level ownership để bệnh nhân không xem nhầm dữ liệu người khác.
- [ ] Backend test hiện chạy bằng default profile và có khởi động JPA với database cấu hình local. Nên tạo `application-test.properties` hoặc test profile riêng để tránh test chạm database thật.

### Kết luận kiểm thử

Dự án hiện build/test pass ở mức tự động và các use case chính có đủ FE/BE. Sau khi sửa lỗi profile ID và route guard, các trang theo role ổn hơn rõ rệt. Tuy vậy, chưa nên kết luận “không còn bug nào” cho production vì còn thiếu test end-to-end FE và còn một số endpoint cần siết ownership theo bệnh nhân/bác sĩ đang đăng nhập.
## Smoke test chạy thật ngày 13/07/2026

### Môi trường đã chạy

- [x] Backend được bật tạm ở `http://127.0.0.1:8080` và đã tắt sau kiểm thử.
- [x] Frontend dev server được bật tạm ở `http://127.0.0.1:5173` và đã tắt sau kiểm thử.
- [x] Frontend trả HTTP 200 và render được root app.

### Kết quả smoke test API

- [x] Đăng ký bệnh nhân bằng API với ngày sinh dạng `dd/MM/yyyy`: thành công.
- [x] Đăng nhập bệnh nhân bằng email: thành công, response có `patientId`.
- [x] Lấy hồ sơ sức khỏe `/api/health-profile/me`: thành công.
- [x] Cập nhật hồ sơ sức khỏe `/api/health-profile/me`: thành công.
- [x] Gọi danh mục chuyên khoa `/api/catalog/specialties` khi có token: thành công.
- [x] Gọi danh mục chuyên khoa khi không có token: bị chặn đúng, HTTP 403.

### Lỗi phát hiện và đã sửa trong smoke test

- [x] Form đăng ký FE trước đó gợi ý ngày sinh `DD/MM/YYYY`, còn backend chỉ parse `yyyy-MM-dd`; người dùng nhập theo gợi ý có thể đăng ký lỗi.
- [x] Backend `AuthService` hiện chấp nhận cả `yyyy-MM-dd` và `dd/MM/yyyy`.
- [x] FE `Register.jsx` đổi input ngày sinh sang `type="date"` để browser gửi chuẩn `yyyy-MM-dd`.

### Kết luận smoke test

Luồng bệnh nhân cơ bản đã chạy thật thành công: đăng ký, đăng nhập, lấy/cập nhật hồ sơ và gọi API cần token. Các luồng admin/bác sĩ vẫn cần tài khoản role thật hoặc dữ liệu seed riêng để smoke test end-to-end đầy đủ.
