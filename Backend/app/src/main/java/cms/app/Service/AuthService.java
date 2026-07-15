package cms.app.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.RefreshToken;
import cms.app.Entity.Specialty;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.RefreshTokenRepository;
import cms.app.Repository.SpecialtyRepository;
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
    private final SpecialtyRepository specialtyRepo;
    private final DoctorRepository doctorRepo;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public AuthService(
            UserRepository userRepo,
            PatientRepository patientRepo,
            RefreshTokenRepository refreshTokenRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authManager,
            UserDetailsService userDetailsService,
            SpecialtyRepository specialtyRepo,
            DoctorRepository doctorRepo) {
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.specialtyRepo = specialtyRepo;
        this.doctorRepo = doctorRepo;
    }

// Đăng ký PATIENT
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // check email trùng
        if (userRepo.existsByEmail(request.getEmail())) {
        throw new IllegalArgumentException("Email đã được sử dụng");
        }
        // check phone trùng
        if (request.getPhone() != null && userRepo.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng");
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
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            profile.setDateOfBirth(parseDateOfBirth(request.getDateOfBirth()));
        }
        profile.setGender(request.getGender());
        patientRepo.save(profile);

        return buildAuthResponse(account);
    }

    // Đăng nhập
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();

        // Spring Security xác thực username + password, ném exception nếu sai
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword())
        );

        User account = userRepo.findByEmailOrPhone(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        if (!account.isStatus()) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

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

        if (!account.isStatus()) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa. Vui lòng đăng nhập lại sau khi được mở khóa.");
        }

        // Cấp lại access token mới (không tạo refresh token mới — rotation tùy chọn)
        UserDetails userDetails = userDetailsService.loadUserByUsername(account.getEmail());
        String newAccessToken = jwtService.generateToken(userDetails, account.getRole().name(), account.getUserId());
        AuthResponse response = new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),  // giữ nguyên refresh token cũ
                account.getUserId(),
                account.getEmail(),
                account.getRole().name()
        );
        attachProfileIds(response, account);
        return response;
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
 
    // 1. Tạo User
    User account = new User();
    account.setEmail(request.getEmail());
    account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    account.setPhone(request.getPhone());
    account.setRole(userRole);
    account.setStatus(true);
    userRepo.save(account);
 
    // 2. Nếu là DOCTOR → tạo thêm Doctor entity
    if (userRole == User.Role.DOCTOR) {
        if (request.getSpecialtyId() == null) {
            throw new IllegalArgumentException("Chuyên khoa không được để trống khi tạo tài khoản bác sĩ");
        }
        Specialty specialty = specialtyRepo.findById(request.getSpecialtyId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy chuyên khoa ID: " + request.getSpecialtyId()));
 
        Doctor doctor = new Doctor();
        doctor.setUser(account);
        doctor.setSpecialty(specialty);
        doctor.setFullName(request.getFullName().trim());
        doctor.setRoomNumber(request.getRoomNumber() != null ? request.getRoomNumber().trim() : null);
        doctorRepo.save(doctor);
    }
 
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
        AuthResponse response = new AuthResponse(
                accessToken,
                refreshToken,
                account.getUserId(),
                account.getEmail(),
                account.getRole().name()
        );
        attachProfileIds(response, account);
        return response;
    }

    private LocalDate parseDateOfBirth(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(trimmed);
        } catch (DateTimeParseException ignored) {
            // Accept the format shown in the Vietnamese registration form.
        }

        try {
            return LocalDate.parse(trimmed, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException ignored) {
            throw new IllegalArgumentException("Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng yyyy-MM-dd hoặc dd/MM/yyyy.");
        }
    }
    private void attachProfileIds(AuthResponse response, User account) {
        if (account.getRole() == User.Role.PATIENT) {
            patientRepo.findByUser_UserId(account.getUserId())
                    .ifPresent(patient -> response.setPatientId(patient.getPatientId()));
        } else if (account.getRole() == User.Role.DOCTOR) {
            doctorRepo.findByUser_UserId(account.getUserId())
                    .ifPresent(doctor -> response.setDoctorId(doctor.getDoctorId()));
        }
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
