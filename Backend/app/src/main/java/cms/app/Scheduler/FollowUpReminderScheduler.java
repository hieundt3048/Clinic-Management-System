package cms.app.Scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import cms.app.Entity.Appointment;
import cms.app.Entity.MedicalRecord;
import cms.app.Repository.AppointmentHistoryRepository;
import cms.app.Repository.MedicalRecordRepository;

/**
 * Job định kỳ mô phỏng kênh nhắc tái khám Hiện ghi log; sau này có thể gắn email/SMS/push.
 */
@Component
public class FollowUpReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(FollowUpReminderScheduler.class);

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentHistoryRepository appointmentHistoryRepository;

    @Value("${app.reminder.follow-up.days-ahead:7}")
    private int daysAhead;

    public FollowUpReminderScheduler(
            MedicalRecordRepository medicalRecordRepository,
            AppointmentHistoryRepository appointmentHistoryRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentHistoryRepository = appointmentHistoryRepository;
    }

    @Scheduled(
            cron = "${app.reminder.follow-up.cron:0 0 8 * * *}",
            zone = "${app.reminder.follow-up.timezone:Asia/Ho_Chi_Minh}")
    public void logDailyFollowUpReminders() {
        LocalDate today = LocalDate.now();
        LocalDate endInclusive = today.plusDays(daysAhead);

        for (MedicalRecord m : medicalRecordRepository.findRecommendedFollowUpsDueBetween(today, endInclusive)) {
            log.info(
                    "[Nhắc tái khám] recordId={} patient={} recommendedDate={} doctor={}",
                    m.getRecordId(),
                    m.getPatient().getFullName(),
                    m.getRecommendedFollowUpDate(),
                    m.getDoctor().getFullName());
        }

        LocalDateTime fromDt = today.atStartOfDay();
        LocalDateTime toDt = endInclusive.plusDays(1).atStartOfDay();
        for (Appointment a : appointmentHistoryRepository.findAllUpcomingFollowUpAppointments(fromDt, toDt)) {
            log.info(
                    "[Lịch tái khám sắp tới] appointmentId={} patient={} at={} doctor={}",
                    a.getAppointmentId(),
                    a.getPatient().getFullName(),
                    a.getAppointmentDate(),
                    a.getDoctor().getFullName());
        }
    }
}
