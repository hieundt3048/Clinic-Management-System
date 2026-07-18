package cms.app.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.MedicationReminderRequest;
import cms.app.Dto.MedicationReminderResponse;
import cms.app.Entity.MedicationReminder;
import cms.app.Entity.Patient;
import cms.app.Entity.Prescription;
import cms.app.Entity.ReminderLog;
import cms.app.Entity.ReminderLog.SendStatus;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.MedicationReminderRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.PrescriptionRepository;
import cms.app.Repository.ReminderLogRepository;

@Service
public class MedicationReminderService implements IMedicationReminderService {

    private static final Logger log = LoggerFactory.getLogger(MedicationReminderService.class);

    private final MedicationReminderRepository reminderRepo;
    private final ReminderLogRepository logRepo;
    private final PatientRepository patientRepo;
    private final PrescriptionRepository prescriptionRepo;
    private final EmailService emailService;

    public MedicationReminderService(
            MedicationReminderRepository reminderRepo,
            ReminderLogRepository logRepo,
            PatientRepository patientRepo,
            PrescriptionRepository prescriptionRepo,
            EmailService emailService) {
        this.reminderRepo = reminderRepo;
        this.logRepo = logRepo;
        this.patientRepo = patientRepo;
        this.prescriptionRepo = prescriptionRepo;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public MedicationReminderResponse createReminder(Integer patientId, MedicationReminderRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        if (reminderRepo.existsByPrescriptionPrescriptionIdAndPatientPatientId(
                request.getPrescriptionId(), patientId)) {
            throw new IllegalArgumentException("Bạn đã tạo lịch nhắc cho đơn thuốc này rồi");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh nhân ID: " + patientId));

        Prescription prescription = prescriptionRepo.findById(request.getPrescriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc ID: " + request.getPrescriptionId()));

        validateEmail(patient);

        MedicationReminder reminder = new MedicationReminder();
        reminder.setPatient(patient);
        reminder.setPrescription(prescription);
        reminder.setReminderTime(request.getReminderTime());
        reminder.setStartDate(request.getStartDate());
        reminder.setEndDate(request.getEndDate());
        reminder.setNote(request.getNote());
        reminder.setChannel("EMAIL");
        reminder.setActive(true);

        reminderRepo.save(reminder);
        return toResponse(reminder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationReminderResponse> getActiveReminders(Integer patientId) {
        return reminderRepo.findActiveByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicationReminderResponse toggleReminder(Integer reminderId, boolean active) {
        MedicationReminder reminder = findById(reminderId);
        reminder.setActive(active);
        reminderRepo.save(reminder);
        return toResponse(reminder);
    }

    @Override
    @Transactional
    public void deleteReminder(Integer reminderId) {
        MedicationReminder reminder = findById(reminderId);
        logRepo.deleteByReminderId(reminderId);
        reminderRepo.delete(reminder);
    }

    @Override
    @Transactional
    public void sendDueReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        List<MedicationReminder> dueList = reminderRepo.findDueReminders(today, now);
        log.info("[Reminder Scheduler] Tìm thấy {} nhắc nhở cần gửi lúc {}", dueList.size(), now);

        for (MedicationReminder reminder : dueList) {
            sendSingleReminder(reminder);
        }
    }

    private void sendSingleReminder(MedicationReminder reminder) {
        LocalDateTime from = LocalDateTime.now().minusMinutes(1);
        LocalDateTime to = LocalDateTime.now();
        boolean alreadySent = logRepo
                .findSuccessInRange(reminder.getReminderId(), from, to)
                .isPresent();

        if (alreadySent) {
            log.debug("[Reminder] Đã gửi nhắc thuốc rồi, bỏ qua");
            return;
        }

        SendStatus status = SendStatus.SUCCESS;
        String errorMsg = null;

        try {
            String email = reminder.getPatient().getUser().getEmail();
            emailService.sendMedicationReminder(reminder, email);
            log.info("[Reminder] Đã gửi email nhắc thuốc cho {}", email);
        } catch (Exception e) {
            status = SendStatus.FAILED;
            errorMsg = e.getMessage();
            log.error("[Reminder] Gửi email nhắc thuốc thất bại: {}", e.getMessage());
        }

        logRepo.save(new ReminderLog(reminder, LocalDateTime.now(), status, errorMsg));
    }

    private MedicationReminder findById(Integer id) {
        return reminderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch nhắc ID: " + id));
    }

    private MedicationReminderResponse toResponse(MedicationReminder r) {
        String email = r.getPatient().getUser() != null
                ? r.getPatient().getUser().getEmail() : "";
        return new MedicationReminderResponse(
                r.getReminderId(),
                r.getPrescription().getPrescriptionId(),
                r.getPatient().getPatientId(),
                r.getPatient().getFullName(),
                email,
                r.getReminderTime(),
                r.getStartDate(),
                r.getEndDate(),
                r.getNote(),
                r.isActive()
        );
    }

    private void validateEmail(Patient patient) {
        if (patient.getUser() == null
                || patient.getUser().getEmail() == null
                || patient.getUser().getEmail().isBlank()) {
            throw new IllegalArgumentException("Bệnh nhân chưa có email để nhận nhắc uống thuốc.");
        }
    }
}