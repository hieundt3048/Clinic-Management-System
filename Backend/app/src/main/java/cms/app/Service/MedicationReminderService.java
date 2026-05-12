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
import cms.app.Entity.MedicationReminder.ReminderChannel;
import cms.app.Entity.Patient;
import cms.app.Entity.Prescription;
import cms.app.Entity.ReminderLog;
import cms.app.Entity.ReminderLog.SendStatus;
import cms.app.Entity.User;
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
    private final SmsService smsService;

    public MedicationReminderService(
            MedicationReminderRepository reminderRepo,
            ReminderLogRepository logRepo,
            PatientRepository patientRepo,
            PrescriptionRepository prescriptionRepo,
            EmailService emailService,
            SmsService smsService) {
        this.reminderRepo = reminderRepo;
        this.logRepo = logRepo;
        this.patientRepo = patientRepo;
        this.prescriptionRepo = prescriptionRepo;
        this.emailService = emailService;
        this.smsService = smsService; 
    }

    // Tạo lịch nhắc
    @Override
    @Transactional
    public MedicationReminderResponse createReminder(Integer patientId, MedicationReminderRequest request) {
        // Validate ngày
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        // Kiểm tra trùng reminder cho cùng đơn thuốc
        if (reminderRepo.existsByPrescriptionPrescriptionIdAndPatientPatientId(
                request.getPrescriptionId(), patientId)) {
            throw new IllegalArgumentException("Bạn đã tạo lịch nhắc cho đơn thuốc này rồi");
        }

        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh nhân ID: " + patientId));

        Prescription prescription = prescriptionRepo.findById(request.getPrescriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn thuốc ID: " + request.getPrescriptionId()));

                // Validate kênh gửi — SMS cần số điện thoại, EMAIL cần email
        validateChannel(request.getChannel(), patient);

        MedicationReminder reminder = new MedicationReminder();
        reminder.setPatient(patient);
        reminder.setPrescription(prescription);
        reminder.setReminderTime(request.getReminderTime());
        reminder.setStartDate(request.getStartDate());
        reminder.setEndDate(request.getEndDate());
        reminder.setNote(request.getNote());
        reminder.setChannel(request.getChannel() != null ? request.getChannel() : ReminderChannel.EMAIL);
        reminder.setActive(true);

        reminderRepo.save(reminder);
        return toResponse(reminder);
    }

    // Lấy danh sách nhắc nhở
    @Override
    @Transactional(readOnly = true)
    public List<MedicationReminderResponse> getActiveReminders(Integer patientId) {
        return reminderRepo.findActiveByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Bật / tắt nhắc nhở
    @Override
    @Transactional
    public MedicationReminderResponse toggleReminder(Integer reminderId, boolean active) {
        MedicationReminder reminder = findById(reminderId);
        reminder.setActive(active);
        reminderRepo.save(reminder);
        return toResponse(reminder);
    }

    // Xóa nhắc nhở
    @Override
    @Transactional
    public void deleteReminder(Integer reminderId) {
        reminderRepo.delete(findById(reminderId));
    }

    // Gửi nhắc nhở — được gọi bởi Scheduler
    @Override
    @Transactional
    public void sendDueReminders() {
        LocalDate today = LocalDate.now();
        // Làm tròn xuống phút để khớp với reminderTime được lưu (không tính giây)
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        List<MedicationReminder> dueList = reminderRepo.findDueReminders(today, now);
        log.info("[Reminder Scheduler] Tìm thấy {} nhắc nhở cần gửi lúc {}", dueList.size(), now);

        for (MedicationReminder reminder : dueList) {
            sendSingleReminder(reminder);
        }
    }

    // Private helpers
    private void sendSingleReminder(MedicationReminder reminder) {
        // Tránh gửi trùng trong cùng 1 phút
        LocalDateTime from = LocalDateTime.now().minusMinutes(1);
        LocalDateTime to   = LocalDateTime.now();
        boolean alreadySent = logRepo
                .findSuccessInRange(reminder.getReminderId(), from, to)
                .isPresent();

        if (alreadySent) {
            log.debug("[Reminder] Đã gửi reminder #{} rồi, bỏ qua", reminder.getReminderId());
            return;
        }

        SendStatus status;
        String errorMsg = null;

        try {
            // ── Gửi theo kênh được chọn ──
            switch (reminder.getChannel()) {
                case EMAIL -> {
                    String email = reminder.getPatient().getUser().getEmail();
                    emailService.sendMedicationReminder(reminder, email);
                    log.info("[Reminder] Email gửi #{} → {}", reminder.getReminderId(), email);
                }
                case SMS -> {
                    String phone = normalizePhone(reminder.getPatient().getUser().getPhone());
                    smsService.sendMedicationReminder(reminder, phone);
                    log.info("[Reminder] SMS gửi #{} → {}", reminder.getReminderId(), phone);
                }
                case BOTH -> {
                    String email = reminder.getPatient().getUser().getEmail();
                    String phone = normalizePhone(reminder.getPatient().getUser().getPhone());
                    emailService.sendMedicationReminder(reminder, email);
                    smsService.sendMedicationReminder(reminder, phone);
                    log.info("[Reminder] Email+SMS gửi #{}", reminder.getReminderId()); 
                }
            }
            status = SendStatus.SUCCESS;
 
        } catch (Exception e) {
            status = SendStatus.FAILED;
            errorMsg = e.getMessage();
            log.error("[Reminder] Gửi thất bại #{}: {}", reminder.getReminderId(), e.getMessage());
        }

        // Ghi log dù thành công hay thất bại
        logRepo.save(new ReminderLog(reminder, LocalDateTime.now(), status, errorMsg));
    }

    /**
     * Chuyển số điện thoại Việt Nam sang định dạng quốc tế cho Twilio.
     * VD: 0901234567 → +84901234567
     */
    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalStateException("Tài khoản người dùng chưa có số điện thoại để gửi SMS");
            }
        if (phone.startsWith("+")) return phone;
        if (phone.startsWith("0")) return "+84" + phone.substring(1);
        return "+84" + phone;
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
                r.isActive(),
                r.getChannel()
        );
    }

    private void validateChannel(ReminderChannel channel, Patient patient) {
    User userAccount = patient.getUser();

    if (channel == ReminderChannel.SMS || channel == ReminderChannel.BOTH) {
        if (userAccount == null
                || userAccount.getPhone() == null
                || userAccount.getPhone().isBlank()) {
            throw new IllegalArgumentException(
                "Bệnh nhân chưa có số điện thoại. Vui lòng cập nhật trước khi dùng kênh SMS.");
        }
    }
    if (channel == ReminderChannel.EMAIL || channel == ReminderChannel.BOTH) {
        if (userAccount == null || userAccount.getEmail() == null) {
            throw new IllegalArgumentException("Bệnh nhân chưa có email.");
        }
    }
    }
}

