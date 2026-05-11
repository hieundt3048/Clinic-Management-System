package cms.app.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.FollowUpReminderResponse;
import cms.app.Entity.Appointment;
import cms.app.Entity.MedicalRecord;
import cms.app.Entity.Patient;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentHistoryRepository;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.PatientRepository;

//ch tái khám: gom ngày tái khám đề nghị trong bệnh án và lịch tái khám đã đặt.
@Service
public class FollowUpReminderService implements IFollowUpReminderService {

    private static final DateTimeFormatter VI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter VI_DATETIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentHistoryRepository appointmentHistoryRepository;

    public FollowUpReminderService(
            PatientRepository patientRepository,
            MedicalRecordRepository medicalRecordRepository,
            AppointmentHistoryRepository appointmentHistoryRepository) {
        this.patientRepository = patientRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentHistoryRepository = appointmentHistoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUpReminderResponse> getMyFollowUpReminders(String userEmail, int daysAhead) {
        Patient patient = patientRepository.findByUser_Email(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ bệnh nhân cho tài khoản: " + userEmail));

        LocalDate today = LocalDate.now();
        LocalDate endInclusive = today.plusDays(daysAhead);

        List<FollowUpReminderResponse> fromRecords = medicalRecordRepository
                .findRecommendedFollowUpsForPatient(patient.getPatientId(), today, endInclusive)
                .stream()
                .map(this::fromMedicalRecord)
                .collect(Collectors.toCollection(ArrayList::new));

        LocalDateTime fromDt = today.atStartOfDay();
        LocalDateTime toDt = endInclusive.plusDays(1).atStartOfDay();

        List<FollowUpReminderResponse> fromAppointments = appointmentHistoryRepository
                .findUpcomingFollowUpAppointmentsForPatient(patient.getPatientId(), fromDt, toDt)
                .stream()
                .map(this::fromAppointment)
                .collect(Collectors.toCollection(ArrayList::new));

        fromRecords.addAll(fromAppointments);
        fromRecords.sort(Comparator.comparing(FollowUpReminderResponse::getOccursAt));
        return fromRecords;
    }

    private FollowUpReminderResponse fromMedicalRecord(MedicalRecord m) {
        FollowUpReminderResponse r = new FollowUpReminderResponse();
        r.setKind(FollowUpReminderResponse.ReminderKind.RECOMMENDED_FOLLOW_UP_DATE);
        r.setReferenceId(m.getRecordId());
        r.setOccursAt(m.getRecommendedFollowUpDate().atStartOfDay());
        r.setTitle("Nhắc tái khám");
        r.setDetail(String.format(
                "Bác sĩ %s đề nghị tái khám trước ngày %s.",
                m.getDoctor().getFullName(),
                VI_DATE.format(m.getRecommendedFollowUpDate())));
        r.setDoctorName(m.getDoctor().getFullName());
        r.setPatientName(m.getPatient().getFullName());
        return r;
    }

    private FollowUpReminderResponse fromAppointment(Appointment a) {
        FollowUpReminderResponse r = new FollowUpReminderResponse();
        r.setKind(FollowUpReminderResponse.ReminderKind.SCHEDULED_FOLLOW_UP_APPOINTMENT);
        r.setReferenceId(a.getAppointmentId());
        r.setOccursAt(a.getAppointmentDate());
        r.setTitle("Lịch tái khám đã đặt");
        r.setDetail(String.format(
                "Bạn có lịch tái khám với %s vào %s.",
                a.getDoctor().getFullName(),
                VI_DATETIME.format(a.getAppointmentDate())));
        r.setDoctorName(a.getDoctor().getFullName());
        r.setPatientName(a.getPatient().getFullName());
        return r;
    }
}
