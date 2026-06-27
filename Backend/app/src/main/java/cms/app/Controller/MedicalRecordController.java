package cms.app.Controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import cms.app.Config.CustomUserDetails;
import cms.app.Dto.ApiResponse;
import cms.app.Repository.CreateMedicalRecordRequest;
import cms.app.Repository.MedicalRecordResponse;
import cms.app.Repository.UpdateMedicalRecordRequest;
import cms.app.Service.IMedicalRecordService;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final IMedicalRecordService recordService;

    public MedicalRecordController(IMedicalRecordService recordService) {
        this.recordService = recordService;
    }

    // POST /api/medical-records — Bác sĩ tạo bệnh án sau khi khám xong
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> create(
            @Valid @RequestBody CreateMedicalRecordRequest request) {
        MedicalRecordResponse result = recordService.createRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo bệnh án thành công", result));
    }

    // PUT /api/medical-records/{recordId} — Bác sĩ cập nhật chẩn đoán/hướng điều trị
    @PutMapping("/{recordId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> update(
            @PathVariable Integer recordId,
            @Valid @RequestBody UpdateMedicalRecordRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        MedicalRecordResponse result = recordService.updateRecord(recordId, user.getDoctorId(), request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Cập nhật bệnh án thành công", result));
    }
    // GET /api/medical-records/doctor/{doctorId} — DS bệnh án của bác sĩ (để chọn khi kê đơn)
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') and #doctorId == authentication.principal.doctorId")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getByDoctor(
            @PathVariable Integer doctorId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Lấy danh sách bệnh án thành công",
                        recordService.getByDoctor(doctorId)));
    }

    // GET /api/medical-records/patient/{patientId} — DS bệnh án của bệnh nhân
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR') or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getByPatient(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Lấy danh sách bệnh án thành công",
                        recordService.getByPatient(patientId)));
    }
}
