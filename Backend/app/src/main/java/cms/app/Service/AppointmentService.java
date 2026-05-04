package cms.app.Service;

import cms.app.AppApplication;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import cms.app.Service.Factory.AppointmentFactory;

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
import jakarta.transaction.Transactional;
import java.util.Optional;
import java.util.List;


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
    public Appointment bookAppointment(AppointmentRequestDTO request) {
        
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
        Appointment newAppointment = appointmentFactory.createPendingAppointment(
                patient, doctor, specialty, request.getAppointmentDate(), request.getReason()
        );

        // 5. Lưu vào Database
        Appointment savedAppointment = appointmentRepo.save(newAppointment);

        // 6. Mapping Entity trả về Response DTO
        return savedAppointment;
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
