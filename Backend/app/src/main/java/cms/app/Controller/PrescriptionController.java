package cms.app.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.CreatePrescriptionRequest;
import cms.app.Dto.PrescriptionResponse;
import cms.app.Service.IPrescriptionService;
import jakarta.validation.Valid;

/**
 * REST Controller kê đơn thuốc.
 */
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final IPrescriptionService prescriptionService;

    public PrescriptionController(IPrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    /**
     * Bác sĩ tạo đơn thuốc mới.
     * POST /api/prescriptions
     */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody CreatePrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.createPrescription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Xem đơn thuốc theo ID.
     * GET /api/prescriptions/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(@PathVariable Integer id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    /**
     * Xem tất cả đơn thuốc của một bệnh án.
     * GET /api/prescriptions/record/{recordId}
     */
    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    public ResponseEntity<List<PrescriptionResponse>> getByRecord(@PathVariable Integer recordId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByRecord(recordId));
    }

    /**
     * Xem toàn bộ lịch sử đơn thuốc của một bệnh nhân.
     * GET /api/prescriptions/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<PrescriptionResponse>> getByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }

    /**
     * Xóa đơn thuốc.
     * DELETE /api/prescriptions/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deletePrescription(@PathVariable Integer id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }
}
