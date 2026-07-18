package cms.app.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Config.CustomUserDetails;
import cms.app.Dto.ApiResponse;
import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;
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
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> bookAppointment(
        @RequestBody AppointmentRequestDTO request) {
        
        AppointmentResponseDTO resultData = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Tạo mới thành công", resultData));
    }

    // API Hủy lịch khám
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(@PathVariable("id") Integer appointmentId) {
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hủy lịch khám thành công!", null));
    }
    
    // API Cập nhật trạng thái lịch khám (admin/bác sĩ phụ trách)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<String>> updateStatus(
        @PathVariable Integer id,
        @RequestParam String status,
        @AuthenticationPrincipal CustomUserDetails user) {
        boolean admin = user != null && user.getRole() != null && "ADMIN".equals(user.getRole().name());
        Integer actorDoctorId = user != null ? user.getDoctorId() : null;

        appointmentService.updateStatus(
                id,
                Appointment.AppointmentStatus.valueOf(status),
                actorDoctorId,
                admin);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Cập nhật thành công", null));
    }
}
