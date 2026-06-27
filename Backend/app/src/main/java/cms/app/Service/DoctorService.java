package cms.app.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.DoctorDetailResponse;
import cms.app.Dto.UpdateDoctorRequest;
import cms.app.Entity.Doctor;
import cms.app.Entity.Specialty;
import cms.app.Exception.BusinessLogicException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.SpecialtyRepository;
import cms.app.Repository.UserRepository;

@Service
@Transactional
public class DoctorService implements IDoctorService {

    private final DoctorRepository doctorRepo;
    private final SpecialtyRepository specialtyRepo;
    private final UserRepository userRepository;

    public DoctorService(DoctorRepository doctorRepo, SpecialtyRepository specialtyRepo, UserRepository userRepository) {
        this.doctorRepo    = doctorRepo;
        this.specialtyRepo = specialtyRepo;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDetailResponse> getAllDoctors() {
        return doctorRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDetailResponse getDoctorById(Integer doctorId) {
        return toResponse(findDoctor(doctorId));
    }

    @Override
    public DoctorDetailResponse updateDoctor(Integer doctorId, UpdateDoctorRequest req) {
        Doctor doctor = findDoctor(doctorId);

        doctor.setFullName(req.getFullName().trim());
        doctor.setRoomNumber(req.getRoomNumber() != null ? req.getRoomNumber().trim() : null);

        // Cập nhật phone qua User
        if (req.getPhone() != null) {
            doctor.getUser().setPhone(req.getPhone().trim());
        }

        // Cập nhật chuyên khoa
        if (!doctor.getSpecialty().getSpecialtyId().equals(req.getSpecialtyId())) {
            Specialty specialty = specialtyRepo.findById(req.getSpecialtyId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy chuyên khoa ID: " + req.getSpecialtyId()));
            doctor.setSpecialty(specialty);
        }

        return toResponse(doctorRepo.save(doctor));
    }

    @Override
    public void toggleDoctorStatus(Integer doctorId, boolean active) {
        Doctor doctor = findDoctor(doctorId);
        doctor.getUser().setStatus(active);
        doctorRepo.save(doctor);
    }

    @Override
    public void deleteDoctor(Integer doctorId) {
        Doctor doctor = findDoctor(doctorId);
        // Kiểm tra còn lịch hẹn PENDING/CONFIRMED không
        boolean hasPending = doctor.getUser().getUserId() != null
                && doctorRepo.existsByDoctorIdAndPendingAppointments(doctorId);
        if (hasPending) {
            throw new BusinessLogicException(
                    "Không thể xoá bác sĩ còn lịch hẹn chưa hoàn thành.");
        }
        doctorRepo.delete(doctor);
    }

    private Doctor findDoctor(Integer id) {
        return doctorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bác sĩ ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDetailResponse getDoctorByEmail(String email) {
        // Tìm User theo email → lấy userId → tìm Doctor
        Integer userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + email))
                .getUserId();
    
        Doctor doctor = doctorRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bác sĩ cho tài khoản: " + email));
    
        return toResponse(doctor);
    }
 

    private DoctorDetailResponse toResponse(Doctor d) {
        return new DoctorDetailResponse(
                d.getDoctorId(),
                d.getFullName(),
                d.getRoomNumber(),
                d.getSpecialty().getSpecialtyId(),
                d.getSpecialty().getSpecialtyName(),
                d.getUser().getEmail(),
                d.getUser().getPhone(),
                d.getUser().isStatus()
        );
    }
}
