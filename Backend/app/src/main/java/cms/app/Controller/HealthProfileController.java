package cms.app.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.HealthProfileResponse;
import cms.app.Dto.UpdateHealthProfileRequest;
import cms.app.Service.IHealthProfileService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/health-profile")
public class HealthProfileController {
    private final IHealthProfileService healthProfileService;

    public HealthProfileController(IHealthProfileService healthProfileService) {
        this.healthProfileService = healthProfileService;
    }

    // Xem hồ sơ sức khỏe của bệnh nhân đang đăng nhập
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<HealthProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        HealthProfileResponse result = healthProfileService.getMyProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Cập nhật hồ sơ sức khỏe của bệnh nhân đang đăng nhập
    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<HealthProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateHealthProfileRequest request) {
        HealthProfileResponse result = healthProfileService.updateMyProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ sức khỏe thành công", result));
    }
}
