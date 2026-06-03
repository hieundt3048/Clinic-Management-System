package cms.app.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.CreateServiceRequestDto;
import cms.app.Dto.ServiceRequestResponse;
import cms.app.Dto.UpdateServiceResultDto;
import cms.app.Entity.ServiceRequest.RequestStatus;
import cms.app.Service.IServiceRequestService;
import jakarta.validation.Valid;

/**
 * REST Controller cho UC10 - Chỉ định cận lâm sàng.
 */
@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {

    private final IServiceRequestService serviceRequestService;

    public ServiceRequestController(IServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    /**
     * Bác sĩ tạo chỉ định cận lâm sàng (1 hoặc nhiều dịch vụ).
     * POST /api/service-requests
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ServiceRequestResponse>> createRequests(
            @Valid @RequestBody CreateServiceRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceRequestService.createRequests(request));
    }

    /**
     * Xem chi tiết một chỉ định.
     * GET /api/service-requests/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    public ResponseEntity<ServiceRequestResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceRequestService.getById(id));
    }

    /**
     * Xem tất cả chỉ định của một bệnh án.
     * GET /api/service-requests/record/{recordId}
     */
    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    public ResponseEntity<List<ServiceRequestResponse>> getByRecord(
            @PathVariable Integer recordId) {
        return ResponseEntity.ok(serviceRequestService.getByRecord(recordId));
    }

    /**
     * Xem toàn bộ lịch sử chỉ định của bệnh nhân.
     * GET /api/service-requests/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<ServiceRequestResponse>> getByPatient(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(serviceRequestService.getByPatient(patientId));
    }

    /**
     * Lọc theo trạng thái — dùng cho dashboard nhân viên y tế.
     * GET /api/service-requests/status/PENDING
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<ServiceRequestResponse>> getByStatus(
            @PathVariable RequestStatus status) {
        return ResponseEntity.ok(serviceRequestService.getByStatus(status));
    }

    /**
     * Cập nhật kết quả sau khi thực hiện cận lâm sàng.
     * PATCH /api/service-requests/{id}/result
     */
    @PatchMapping("/{id}/result")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ServiceRequestResponse> updateResult(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateServiceResultDto dto) {
        return ResponseEntity.ok(serviceRequestService.updateResult(id, dto));
    }

    /**
     * Hủy chỉ định (chỉ khi PENDING).
     * PATCH /api/service-requests/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ServiceRequestResponse> cancelRequest(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceRequestService.cancelRequest(id));
    }
}
