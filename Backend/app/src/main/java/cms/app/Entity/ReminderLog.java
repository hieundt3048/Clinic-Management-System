package cms.app.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity ghi log mỗi lần hệ thống gửi nhắc nhở.
 */
@Entity
@Table(name = "ReminderLog")
public class ReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reminderId", nullable = false)
    private MedicationReminder reminder;

    /** Thời điểm gửi thực tế */
    @Column(nullable = false)
    private LocalDateTime sentAt;

    /** Trạng thái gửi */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SendStatus status;

    /** Lý do thất bại nếu có */
    @Column(length = 500)
    private String errorMessage;

    public enum SendStatus {
        SUCCESS, FAILED
    }

    public ReminderLog() {}

    public ReminderLog(MedicationReminder reminder, LocalDateTime sentAt,
                       SendStatus status, String errorMessage) {
        this.reminder = reminder;
        this.sentAt = sentAt;
        this.status = status;
        this.errorMessage = errorMessage;
    }


    public Integer getLogId() { return logId; }
    public MedicationReminder getReminder() { return reminder; }
    public void setReminder(MedicationReminder reminder) { this.reminder = reminder; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public SendStatus getStatus() { return status; }
    public void setStatus(SendStatus status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
