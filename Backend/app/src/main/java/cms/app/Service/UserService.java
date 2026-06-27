package cms.app.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.UserAccountResponse;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.User;
import cms.app.Exception.BusinessLogicException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public UserService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UserAccountResponse> getAllAccounts() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "userId"))
                .stream()
                .map(this::toAccountResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAccountResponse updateAccountStatus(Integer userId, boolean active, Integer currentAdminUserId) {
        if (userId != null && userId.equals(currentAdminUserId) && !active) {
            throw new BusinessLogicException("Không thể khóa chính tài khoản quản trị đang đăng nhập.");
        }

        User account = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản ID: " + userId));

        account.setStatus(active);
        User saved = userRepository.save(account);
        return toAccountResponse(saved);
    }

    private UserAccountResponse toAccountResponse(User user) {
        UserAccountResponse response = new UserAccountResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setActive(user.isStatus());
        response.setDisplayName(user.getEmail());

        if (user.getRole() == User.Role.PATIENT) {
            patientRepository.findByUser_UserId(user.getUserId()).ifPresent(patient -> fillPatient(response, patient));
        } else if (user.getRole() == User.Role.DOCTOR) {
            doctorRepository.findByUser_UserId(user.getUserId()).ifPresent(doctor -> fillDoctor(response, doctor));
        } else if (user.getRole() == User.Role.ADMIN) {
            response.setDisplayName("Quản trị viên");
        }

        return response;
    }

    private void fillPatient(UserAccountResponse response, Patient patient) {
        response.setPatientId(patient.getPatientId());
        response.setDisplayName(patient.getFullName());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setGender(patient.getGender());
        response.setAddress(patient.getAddress());
    }

    private void fillDoctor(UserAccountResponse response, Doctor doctor) {
        response.setDoctorId(doctor.getDoctorId());
        response.setDisplayName(doctor.getFullName());
        response.setRoomNumber(doctor.getRoomNumber());
        if (doctor.getSpecialty() != null) {
            response.setSpecialtyName(doctor.getSpecialty().getSpecialtyName());
        }
    }
}