package cms.app.Service;

import cms.app.AppApplication;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.SpecialtyRepository;
import jakarta.transaction.Transactional;
import java.util.List;


@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final SpecialtyRepository specialtyRepo;

    public AppointmentService(AppointmentRepository appointmentRepo, PatientRepository patientRepo, DoctorRepository doctorRepo, SpecialtyRepository specialtyRepo) {
        this.appointmentRepo = appointmentRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.specialtyRepo = specialtyRepo;
    }
    
    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu: Nếu có lỗi xảy ra ở giữa hàm, toàn bộ thao tác DB sẽ bị Rollback
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request) {
        
        // 1. Kiểm tra sự tồn tại của dữ liệu (Validation)
        Patient patient = patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân với ID: " + request.getPatientId()));
                
        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + request.getDoctorId()));
                
        Specialty specialty = specialtyRepo.findById(request.getSpecialtyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + request.getSpecialtyId()));

        // 2. Kiểm tra tính hợp lệ của thời gian (Không cho đặt lịch trong quá khứ)
        if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Không thể đặt lịch vào thời gian trong quá khứ!");
        }

        // 3. Kiểm tra trùng lịch (Logic: 1 ca khám kéo dài 30 phút)
        LocalDateTime startTime = request.getAppointmentDate();
        LocalDateTime endTime = startTime.plusMinutes(30);
        List<Appointment> overlapping = appointmentRepo.findOverlappingAppointments(doctor.getDoctorId(), startTime, endTime);
        
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Bác sĩ đã có lịch khám vào khung giờ này. Vui lòng chọn giờ khác.");
        }

        // 4. Mapping dữ liệu từ DTO sang Entity để lưu xuống Database
        Appointment newAppointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .specialty(specialty)
                .appointmentDate(request.getAppointmentDate())
                .reason(request.getReason())
                .status(AppointmentStatus.PENDING) // Trạng thái mặc định là Chờ xác nhận
                .isFollowUp(false)
                .build();

        // 5. Lưu vào Database
        Appointment savedAppointment = appointmentRepo.save(newAppointment);

        // 6. (Optional) Gọi một service khác để gửi Email/SMS thông báo ở đây
        // notificationService.sendSms(patient.getPhone(), "Đặt lịch thành công...");

        // 7. Mapping Entity trả về Response DTO
        return AppointmentResponseDTO.builder()
                .appointmentId(savedAppointment.getAppointmentId())
                .patientName(savedAppointment.getPatient().getFullName())
                .doctorName(savedAppointment.getDoctor().getFullName())
                .specialtyName(savedAppointment.getSpecialty().getSpecialtyName())
                .appointmentDate(savedAppointment.getAppointmentDate())
                .status(savedAppointment.getStatus().name())
                .build();
    }

    @Override
    @Transactional
    public void cancelAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn."));
                
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy lịch khám đã hoàn thành.");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepo.save(appointment);
    }
}
