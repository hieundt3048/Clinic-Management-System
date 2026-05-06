package cms.app.Controller;

import cms.app.Dto.*;
import cms.app.Service.IAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoints (không cần token):
 *   POST /api/auth/register       → Đăng ký PATIENT
 *   POST /api/auth/login          → Đăng nhập
 *   POST /api/auth/refresh        → Lấy Access Token mới
 *
 * Protected endpoints (cần token):
 *   POST /api/auth/logout         → Đăng xuất
 *   POST /api/auth/create-staff   → Admin tạo tài khoản DOCTOR/ADMIN
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng ký tài khoản bệnh nhân mới.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đăng nhập.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Dùng Refresh Token để lấy Access Token mới.
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Đăng xuất — thu hồi Refresh Token.
     * POST /api/auth/logout
     * Header: Authorization: Bearer <access_token>
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin tạo tài khoản cho DOCTOR hoặc ADMIN.
     * POST /api/auth/create-staff?role=DOCTOR
     * Header: Authorization: Bearer <admin_token>
     */
    @PostMapping("/create-staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createStaff(
            @Valid @RequestBody RegisterRequest request,
            @RequestParam(defaultValue = "DOCTOR") String role) {
        AuthResponse response = authService.createStaffAccount(request, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
