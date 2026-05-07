package cms.app.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.HealthProfileResponse;
import cms.app.Dto.UpdateHealthProfileRequest;
import cms.app.Entity.Patient;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.PatientRepository;

// Hồ sơ sức khỏe cho bệnh nhân đang đăng nhập.
@Service
public class HealthProfileService implements IHealthProfileService {
    // Repository truy vấn hồ sơ bệnh nhân, liên kết với User qua email tài khoản đăng nhập.
    private final PatientRepository patientRepository;

    public HealthProfileService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Lấy hồ sơ sức khỏe của người dùng
    @Override
    @Transactional(readOnly = true)
    public HealthProfileResponse getMyProfile(String email) {
        // Tìm bệnh nhân theo email tài khoản; không có thì trả lỗi 404 nghiệp vụ.
        Patient patient = patientRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ sức khỏe cho tài khoản: " + email));

        // Trả về DTO để không lộ trực tiếp Entity ra API.
        return toResponse(patient);
    }

    // Cập nhật thông tin hồ sơ sức khỏe của chính người dùng hiện tại.
    @Override
    @Transactional
    public HealthProfileResponse updateMyProfile(String email, UpdateHealthProfileRequest request) {
        // Bắt buộc phải có hồ sơ bệnh nhân tương ứng tài khoản.
        Patient patient = patientRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ sức khỏe cho tài khoản: " + email));

        // Cập nhật các trường thuộc bảng patients.
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());

        // Số điện thoại nằm ở bảng users nên cập nhật qua entity User liên kết.
        User user = patient.getUser();
        user.setPhone(request.getPhone());

        // Lưu và map lại thành DTO response.
        Patient savedPatient = patientRepository.save(patient);
        return toResponse(savedPatient);
    }

    // Hàm dùng chung để map Patient Entity -> HealthProfileResponse DTO.
    private HealthProfileResponse toResponse(Patient patient) {
        HealthProfileResponse response = new HealthProfileResponse();
        response.setPatientId(patient.getPatientId());
        response.setUserId(patient.getUser().getUserId());
        response.setFullName(patient.getFullName());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setGender(patient.getGender());
        response.setAddress(patient.getAddress());
        response.setEmail(patient.getUser().getEmail());
        response.setPhone(patient.getUser().getPhone());
        return response;
    }
}
