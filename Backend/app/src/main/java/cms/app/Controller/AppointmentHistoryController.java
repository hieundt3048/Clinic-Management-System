package cms.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.AppointmentFilterRequest;
import cms.app.Dto.AppointmentHistoryResponse;
import cms.app.Service.IAppointmentHistoryService;

// API Controller cho lịch sử đặt khám
@RestController
@RequestMapping("/api/appointments/history")
public class AppointmentHistoryController {

    private final IAppointmentHistoryService historyService;

    public AppointmentHistoryController(IAppointmentHistoryService historyService) {
        this.historyService = historyService;
    }

    //Lấy lịch sử đặt khám của một bệnh nhân.
    // @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and #patientId == principal.patientId)")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentHistoryResponse>> getPatientHistory(
            @PathVariable Integer patientId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        AppointmentFilterRequest filter = buildFilter(status, fromDate, toDate);
        List<AppointmentHistoryResponse> result = historyService.getHistoryByPatient(patientId, filter);
        return ResponseEntity.ok(result);
    }

    //Lấy danh sách lịch hẹn của một bác sĩ.
    // @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and #doctorId == principal.doctorId)")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentHistoryResponse>> getDoctorHistory(
            @PathVariable Integer doctorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        AppointmentFilterRequest filter = buildFilter(status, fromDate, toDate);
        List<AppointmentHistoryResponse> result = historyService.getHistoryByDoctor(doctorId, filter);
        return ResponseEntity.ok(result);
    }

    //Lấy toàn bộ lịch sử đặt khám trong hệ thống.
    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AppointmentHistoryResponse>> getAllHistory(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        AppointmentFilterRequest filter = buildFilter(status, fromDate, toDate);
        List<AppointmentHistoryResponse> result = historyService.getAllHistory(filter);
        return ResponseEntity.ok(result);
    }

    /**
     * Xây dựng filter object từ query params.
     * Parse status string thành enum, trả null nếu không hợp lệ (không crash).
     */
    private AppointmentFilterRequest buildFilter(String status, LocalDate fromDate, LocalDate toDate) {
        if (status == null && fromDate == null && toDate == null) {
            return null;
        }

        AppointmentFilterRequest filter = new AppointmentFilterRequest();
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);

        if (status != null) {
            try {
                filter.setStatus(
                    cms.app.Entity.Appointment.AppointmentStatus.valueOf(status.toUpperCase())
                );
            } catch (IllegalArgumentException ignored) {
                // Status không hợp lệ → bỏ qua filter status
            }
        }

        return filter;
    }
}
