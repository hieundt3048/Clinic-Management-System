package cms.app.Controller;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.DoctorDetailResponse;
import cms.app.Dto.UpdateDoctorRequest;
import cms.app.Service.IDoctorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@PreAuthorize("hasRole('ADMIN')")
public class DoctorController {

    private final IDoctorService doctorService;

    public DoctorController(IDoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // GET /api/doctors
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDetailResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }

    // GET /api/doctors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDetailResponse>> getDoctor(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDetailResponse>> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            ApiResponse.success(doctorService.getDoctorByEmail(userDetails.getUsername()))
        );
    }

    // PUT /api/doctors/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDetailResponse>> updateDoctor(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateDoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.updateDoctor(id, request)));
    }

    // PATCH /api/doctors/{id}/status?active=true|false
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> toggleStatus(
            @PathVariable Integer id,
            @RequestParam boolean active) {
        doctorService.toggleDoctorStatus(id, active);
        String msg = active ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // DELETE /api/doctors/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDoctor(@PathVariable Integer id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xoá bác sĩ thành công"));
    }
}
