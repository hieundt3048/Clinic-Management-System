package cms.app.Controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Entity.Appointment;
import cms.app.Service.IAppointmentService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final IAppointmentService appointmentService;

    public AppointmentController(IAppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // API Đặt lịch khám
    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(
        @RequestBody AppointmentRequestDTO request) {
        
        // 1. Gọi Service để xử lý logic
        Appointment resultData = appointmentService.bookAppointment(request);

        // 2. Trả về chuẩn HTTP Response của Spring Boot
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Tạo mới thành công", resultData));
    }

    // API Hủy lịch khám
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(@PathVariable("id") Integer appointmentId) {
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy lịch khám thành công!", null));
    }
}
