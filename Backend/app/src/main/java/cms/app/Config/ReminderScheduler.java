package cms.app.Config;

import cms.app.Service.IMedicationReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler tự động gửi nhắc uống thuốc.
 *
 * Cần thêm @EnableScheduling vào AppApplication.java:
 *   @SpringBootApplication
 *   @EnableScheduling   ← thêm dòng này
 *   public class AppApplication { ... }
 */
@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final IMedicationReminderService reminderService;

    public ReminderScheduler(IMedicationReminderService reminderService) {
        this.reminderService = reminderService;
    }

    /**
     * Chạy mỗi phút, đúng vào giây thứ 0.
     * Cron: "0 * * * * *" = giây 0, mọi phút, mọi giờ, mọi ngày.
     *
     * Nếu muốn tiết kiệm tài nguyên hơn, đổi thành mỗi 5 phút:
     *   "0 0/5 * * * *"
     * Nhưng khi đó reminderTime chỉ nên đặt theo bội của 5 phút.
     */
    @Scheduled(cron = "0 * * * * *")
    public void triggerMedicationReminders() {
        log.debug("[Scheduler] Kiểm tra nhắc uống thuốc...");
        reminderService.sendDueReminders();
    }
}
