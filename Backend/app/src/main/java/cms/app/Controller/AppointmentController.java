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
import cms.app.Dto.AppointmentResponseDTO;
import cms.app.Service.IAppointmentService;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final IAppointmentService appointmentService;

    public AppointmentController(IAppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // API Đặt lịch khám
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> bookAppointment(
            @RequestBody AppointmentRequestDTO request) {
        
        // 1. Gọi Service để xử lý logic
        AppointmentResponseDTO resultData = appointmentService.bookAppointment(request);

        // 2. Đóng gói dữ liệu vào ApiResponse
        ApiResponse<AppointmentResponseDTO> response = ApiResponse.<AppointmentResponseDTO>builder()
                .status(HttpStatus.CREATED.value()) // 201 Created
                .message("Đặt lịch khám thành công!")
                .data(resultData)
                .build();

        // 3. Trả về chuẩn HTTP Response của Spring Boot
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // API Hủy lịch khám
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(@PathVariable("id") Integer appointmentId) {
        
        appointmentService.cancelAppointment(appointmentId);
        
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.OK.value()) // 200 OK
                .message("Hủy lịch khám thành công!")
                .data(null) // Không có dữ liệu trả về thêm
                .build();

        return ResponseEntity.ok(response);
    }
}
