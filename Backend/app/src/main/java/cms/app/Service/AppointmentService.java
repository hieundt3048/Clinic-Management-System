package cms.app.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceCatalog.ServiceType;
import cms.app.Entity.Specialty;
import cms.app.Exception.BusinessLogicException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.ServiceCatalogRepository;
import cms.app.Repository.SpecialtyRepository;
import cms.app.Service.Factory.AppointmentFactory;
import jakarta.transaction.Transactional;

@Service
public class AppointmentService implements IAppointmentService {

    private static final DateTimeFormatter DISPLAY_DATE_TIME = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final SpecialtyRepository specialtyRepo;
    private final AppointmentFactory appointmentFactory;
    private final ServiceCatalogRepository serviceCatalogRepo;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            PatientRepository patientRepo,
            DoctorRepository doctorRepo,
            SpecialtyRepository specialtyRepo,
            AppointmentFactory appointmentFactory,
            ServiceCatalogRepository serviceCatalogRepo,
            NotificationService notificationService) {
        this.appointmentRepo = appointmentRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.specialtyRepo = specialtyRepo;
        this.appointmentFactory = appointmentFactory;
        this.serviceCatalogRepo = serviceCatalogRepo;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request) {
        if (request.getPatientId() == null)
            throw new BusinessLogicException("Patient ID không được để trống.");
        if (request.getDoctorId() == null)
            throw new BusinessLogicException("Doctor ID không được để trống.");
        if (request.getSpecialtyId() == null)
            throw new BusinessLogicException("Specialty ID không được để trống.");
        if (request.getAppointmentDate() == null)
            throw new BusinessLogicException("Ngày hẹn không được để trống.");

        Patient patient = patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh nhân với ID: " + request.getPatientId()));

        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bác sĩ với ID: " + request.getDoctorId()));

        Specialty specialty = specialtyRepo.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chuyên khoa với ID: " + request.getSpecialtyId()));

        ServiceCatalog service = resolveConsultationService(request.getServiceId());

        if (request.getAppointmentDate().isBefore(LocalDateTime.now()))
            throw new BusinessLogicException("Không thể đặt lịch vào thời gian trong quá khứ!");

        LocalDateTime startTime = request.getAppointmentDate();
        LocalDateTime endTime = startTime.plusMinutes(30);
        List<Appointment> overlapping = appointmentRepo.findOverlappingAppointments(
                doctor.getDoctorId(), startTime, endTime);

        if (!overlapping.isEmpty())
            throw new BusinessLogicException(
                    "Bác sĩ đã có lịch khám vào khung giờ này. Vui lòng chọn giờ khác.");

        boolean followUp = Boolean.TRUE.equals(request.getFollowUp());
        Appointment newAppointment = appointmentFactory.createPendingAppointment(
                patient, doctor, specialty,
                request.getAppointmentDate(), request.getReason(), followUp);

        if (newAppointment != null) {
            newAppointment.setService(service);
            Appointment saved = appointmentRepo.save(newAppointment);
            notificationService.notifyDoctor(
                    saved.getDoctor(),
                    "APPOINTMENT_NEW",
                    "Có lịch khám mới",
                    saved.getPatient().getFullName() + " vừa đặt lịch khám lúc "
                            + formatAppointmentTime(saved) + ". Vui lòng kiểm tra và xác nhận lịch.",
                    "/doctor");
            notificationService.notifyAdmins(
                    "APPOINTMENT_NEW",
                    "Có lịch hẹn mới cần xử lý",
                    saved.getPatient().getFullName() + " vừa đặt lịch với "
                            + saved.getDoctor().getFullName() + " lúc " + formatAppointmentTime(saved) + ".",
                    "/admin/appointments");
            return toResponse(saved);
        }

        throw new BusinessLogicException("Không thể tạo lịch hẹn.");
    }

    @Override
    @Transactional
    public void cancelAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn."));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED)
            throw new RuntimeException("Không thể hủy lịch khám đã hoàn thành.");

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepo.save(appointment);
        notificationService.notifyDoctor(
                appointment.getDoctor(),
                "APPOINTMENT_CANCELLED",
                "Lịch khám đã bị hủy",
                "Lịch khám của " + appointment.getPatient().getFullName() + " lúc "
                        + formatAppointmentTime(appointment) + " đã bị hủy.",
                "/doctor");
        notificationService.notifyAdmins(
                "APPOINTMENT_CANCELLED",
                "Lịch khám đã bị hủy",
                "Lịch khám của " + appointment.getPatient().getFullName() + " với "
                        + appointment.getDoctor().getFullName() + " lúc " + formatAppointmentTime(appointment) + " đã bị hủy.",
                "/admin/appointments");
    }

    @Override
    @Transactional
    public void updateStatus(Integer appointmentId, AppointmentStatus newStatus) {
        updateStatus(appointmentId, newStatus, null, true);
    }

    @Override
    @Transactional
    public void updateStatus(Integer appointmentId, AppointmentStatus newStatus, Integer actorDoctorId, boolean admin) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch hẹn với ID: " + appointmentId));

        if (!admin) {
            if (actorDoctorId == null || appointment.getDoctor() == null
                    || !appointment.getDoctor().getDoctorId().equals(actorDoctorId)) {
                throw new BusinessLogicException("Bác sĩ chỉ được cập nhật lịch hẹn của chính mình.");
            }
        }

        AppointmentStatus current = appointment.getStatus();
        boolean valid =
                (current == AppointmentStatus.PENDING && newStatus == AppointmentStatus.CONFIRMED)
             || (current == AppointmentStatus.CONFIRMED && newStatus == AppointmentStatus.COMPLETED);

        if (!valid)
            throw new BusinessLogicException(
                    "Không thể chuyển từ trạng thái " + current + " sang " + newStatus);

        appointment.setStatus(newStatus);
        appointmentRepo.save(appointment);

        if (newStatus == AppointmentStatus.CONFIRMED) {
            notificationService.notifyPatient(
                    appointment.getPatient(),
                    "APPOINTMENT_CONFIRMED",
                    "Lịch khám đã được xác nhận",
                    "Lịch khám với " + appointment.getDoctor().getFullName() + " lúc "
                            + formatAppointmentTime(appointment) + " đã được xác nhận.",
                    "/appointment-notifications");
            notificationService.notifyDoctor(
                    appointment.getDoctor(),
                    "APPOINTMENT_CONFIRMED",
                    "Lịch khám đã được xác nhận",
                    "Lịch khám của " + appointment.getPatient().getFullName() + " lúc "
                            + formatAppointmentTime(appointment) + " đã sẵn sàng trong lịch làm việc.",
                    "/doctor");
            if (!admin) {
                notificationService.notifyAdmins(
                        "APPOINTMENT_CONFIRMED",
                        "Bác sĩ đã xác nhận lịch khám",
                        appointment.getDoctor().getFullName() + " đã xác nhận lịch khám của "
                                + appointment.getPatient().getFullName() + " lúc " + formatAppointmentTime(appointment) + ".",
                        "/admin/appointments");
            }
        } else if (newStatus == AppointmentStatus.COMPLETED) {
            notificationService.notifyPatient(
                    appointment.getPatient(),
                    "APPOINTMENT_COMPLETED",
                    "Buổi khám đã hoàn thành",
                    "Buổi khám với " + appointment.getDoctor().getFullName()
                            + " đã hoàn thành. Bạn có thể theo dõi bệnh án, đơn thuốc hoặc hóa đơn nếu có phát sinh.",
                    "/appointment-history");
            notificationService.notifyAdmins(
                    "APPOINTMENT_COMPLETED",
                    "Bác sĩ đã hoàn thành buổi khám",
                    appointment.getDoctor().getFullName() + " đã hoàn thành buổi khám của "
                            + appointment.getPatient().getFullName() + ".",
                    "/admin/appointments");
        }
    }

    private String formatAppointmentTime(Appointment appointment) {
        return appointment.getAppointmentDate().format(DISPLAY_DATE_TIME);
    }

    private ServiceCatalog resolveConsultationService(Integer serviceId) {
        ServiceCatalog service;
        if (serviceId != null) {
            service = serviceCatalogRepo.findById(serviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ khám ID: " + serviceId));
        } else {
            service = serviceCatalogRepo.findFirstByServiceNameIgnoreCase("Khám chuyên khoa")
                    .orElseGet(() -> serviceCatalogRepo.findByServiceType(ServiceType.CONSULTATION)
                            .stream()
                            .findFirst()
                            .orElseThrow(() -> new BusinessLogicException("Chưa cấu hình dịch vụ phí khám lâm sàng.")));
        }

        if (service.getServiceType() != ServiceType.CONSULTATION) {
            throw new BusinessLogicException("Lịch hẹn chỉ được gắn phí khám lâm sàng, không được chọn dịch vụ cận lâm sàng.");
        }
        return service;
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
}