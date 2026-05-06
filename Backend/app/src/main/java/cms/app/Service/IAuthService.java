package cms.app.Service;

import cms.app.Dto.*;

/**
 * Interface cho AuthService.
 */
public interface IAuthService {

    /** Đăng ký tài khoản mới cho PATIENT */
    AuthResponse register(RegisterRequest request);

    /** Đăng nhập, trả về Access Token + Refresh Token */
    AuthResponse login(LoginRequest request);

    /** Dùng Refresh Token để lấy Access Token mới */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /** Đăng xuất — thu hồi Refresh Token */
    void logout(String email);

    /**
     * Admin tạo tài khoản cho DOCTOR hoặc ADMIN.
     */
    AuthResponse createStaffAccount(RegisterRequest request, String role);
}
