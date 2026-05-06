package cms.app.Service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.AuthResponse;
import cms.app.Dto.LoginRequest;
import cms.app.Dto.RefreshTokenRequest;
import cms.app.Dto.RegisterRequest;
import cms.app.Entity.Patient;
import cms.app.Entity.RefreshToken;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.RefreshTokenRepository;
import cms.app.Repository.UserRepository;

/**
 * Implementation của IAuthService.
 * Xử lý đăng ký, đăng nhập, refresh token và logout.
 */
@Service
public class AuthService implements IAuthService {

    private final UserRepository userRepo;
    private final PatientRepository patientRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthService(
            UserRepository userRepo,
            PatientRepository patientRepo,
            RefreshTokenRepository refreshTokenRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authManager,
            UserDetailsService userDetailsService) {
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
    }

    // Đăng ký PATIENT
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email trùng
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng: " + request.getEmail());
        }

        // Tạo UserAccount
        User account = new User();
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(User.Role.PATIENT);
        userRepo.save(account);

        // Tạo PatientProfile liên kết
        Patient profile = new Patient();
        profile.setFullName(request.getFullName());
        profile.setUser(account);
        patientRepo.save(profile);

        return buildAuthResponse(account);
    }

    // Đăng nhập
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security xác thực email + password, ném exception nếu sai
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User account = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        return buildAuthResponse(account);
    }

    // Refresh Token
    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepo.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token không hợp lệ"));

        // Kiểm tra hết hạn
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepo.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }

        User account = refreshToken.getUser();

        // Cấp lại access token mới (không tạo refresh token mới — rotation tùy chọn)
        UserDetails userDetails = userDetailsService.loadUserByUsername(account.getEmail());
        String newAccessToken = jwtService.generateToken(userDetails, account.getRole().name(), account.getUserId());

        return new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),  // giữ nguyên refresh token cũ
                account.getUserId(),
                account.getEmail(),
                account.getRole().name()
        );
    }

    // Logout
    @Override
    @Transactional
    public void logout(String email) {
        User account = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        // Thu hồi tất cả refresh token của user này
        refreshTokenRepo.deleteByUser(account);
    }

    // Admin tạo tài khoản staff
    @Override
    @Transactional
    public AuthResponse createStaffAccount(RegisterRequest request, String role) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng: " + request.getEmail());
        }

        User.Role userRole;
        try {
            userRole = User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role không hợp lệ: " + role);
        }

        if (userRole == User.Role.PATIENT) {
            throw new IllegalArgumentException("Dùng /register để tạo tài khoản bệnh nhân");
        }

        User account = new User();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(userRole);
        userRepo.save(account);

        return buildAuthResponse(account);
    }


    // Private helpers
    /**
     * Tạo Access Token + Refresh Token và trả về AuthResponse.
     * Refresh token cũ bị xóa và thay mới (token rotation).
     */
    private AuthResponse buildAuthResponse(User account) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(account.getEmail());

        String accessToken = jwtService.generateToken(
                userDetails, account.getRole().name(), account.getUserId());

        String refreshToken = createRefreshToken(account);

        return new AuthResponse(
                accessToken,
                refreshToken,
                account.getUserId(),
                account.getEmail(),
                account.getRole().name()
        );
    }

    /** Tạo Refresh Token mới, lưu DB, xóa token cũ (rotation) */
    private String createRefreshToken(User account) {
        // Xóa token cũ trước
        refreshTokenRepo.deleteByUser(account);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(account);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        refreshTokenRepo.save(refreshToken);

        return refreshToken.getToken();
    }
}
