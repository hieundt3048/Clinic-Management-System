package cms.app.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;
import cms.app.Exception.BusinessLogicException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.SpecialtyRepository;
import cms.app.Service.Factory.AppointmentFactory;
import jakarta.transaction.Transactional;


@Service
public class AppointmentService implements IAppointmentService{

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final SpecialtyRepository specialtyRepo;
    private final AppointmentFactory appointmentFactory;

    public AppointmentService(AppointmentRepository appointmentRepo, PatientRepository patientRepo, DoctorRepository doctorRepo, SpecialtyRepository specialtyRepo, AppointmentFactory appointmentFactory) {
        this.appointmentRepo = appointmentRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.specialtyRepo = specialtyRepo;
        this.appointmentFactory = appointmentFactory;
    }
    
    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu: Nếu có lỗi xảy ra ở giữa hàm, toàn bộ thao tác DB sẽ bị Rollback
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request) {
        
        // 0. Kiểm tra đầu vào (Input Validation)
        if (request.getPatientId() == null) {
            throw new BusinessLogicException("Patient ID không được để trống.");
        }
        if (request.getDoctorId() == null) {
            throw new BusinessLogicException("Doctor ID không được để trống.");
        }
        if (request.getSpecialtyId() == null) {
            throw new BusinessLogicException("Specialty ID không được để trống.");
        }
        if (request.getAppointmentDate() == null) {
            throw new BusinessLogicException("Ngày hẹn không được để trống.");
        }

        // 1. Kiểm tra sự tồn tại (Dùng ResourceNotFoundException để bắn ra lỗi 404)
        Patient patient = patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh nhân với ID: " + request.getPatientId()));
                
        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bác sĩ với ID: " + request.getDoctorId()));
                
        Specialty specialty = specialtyRepo.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên khoa với ID: " + request.getSpecialtyId()));

        // 2. Kiểm tra tính hợp lệ của thời gian (Dùng BusinessLogicException để bắn ra lỗi 400 Bad Request)
        if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Không thể đặt lịch vào thời gian trong quá khứ!");
        }

        // 3. Kiểm tra trùng lịch
        LocalDateTime startTime = request.getAppointmentDate();
        LocalDateTime endTime = startTime.plusMinutes(30);
        List<Appointment> overlapping = appointmentRepo.findOverlappingAppointments(doctor.getDoctorId(), startTime, endTime);
        
        if (!overlapping.isEmpty()) {
            throw new BusinessLogicException("Bác sĩ đã có lịch khám vào khung giờ này. Vui lòng chọn giờ khác.");
        }

        // 4. Mapping dữ liệu từ DTO sang Entity
        boolean followUp = Boolean.TRUE.equals(request.getFollowUp());
        Appointment newAppointment = appointmentFactory.createPendingAppointment(
                patient, doctor, specialty, request.getAppointmentDate(), request.getReason(), followUp
        );

        // 5. Lưu vào Database
        if (newAppointment != null) {
            Appointment savedAppointment = appointmentRepo.save(newAppointment);
            return toResponse(savedAppointment);
        }
        
        throw new BusinessLogicException("Không thể tạo lịch hẹn.");
    }

    private AppointmentResponseDTO toResponse(Appointment a) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setAppointmentId(a.getAppointmentId());
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setStatus(a.getStatus());
        dto.setReason(a.getReason());
        dto.setFollowUp(a.isFollowUp());
        dto.setPatientId(a.getPatient().getPatientId());
        dto.setPatientName(a.getPatient().getFullName());
        dto.setDoctorId(a.getDoctor().getDoctorId());
        dto.setDoctorName(a.getDoctor().getFullName());
        dto.setRoomNumber(a.getDoctor().getRoomNumber());
        dto.setSpecialtyId(a.getSpecialty().getSpecialtyId());
        dto.setSpecialtyName(a.getSpecialty().getSpecialtyName());
        return dto;
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
