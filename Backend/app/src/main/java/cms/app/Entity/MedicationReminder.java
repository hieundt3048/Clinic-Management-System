package cms.app.Entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity lưu lịch nhắc uống thuốc của bệnh nhân.
 * Mỗi record = 1 khung giờ nhắc cho 1 đơn thuốc cụ thể.
 */
@Entity
@Table(name = "MedicationReminder")
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reminderId;

    /** Liên kết tới đơn thuốc được nhắc */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescriptionId", nullable = false)
    private Prescription prescription;

    /** Liên kết tới bệnh nhân nhận nhắc */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patientId", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private LocalTime reminderTime;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(length = 255)
    private String note;

    @Column(nullable = false)
    private boolean active = true;

    /** Kênh gửi: EMAIL, SMS */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ReminderChannel channel = ReminderChannel.EMAIL;

    public enum ReminderChannel {
        EMAIL, SMS, BOTH
    }

    public MedicationReminder() {}

    public Integer getReminderId() { return reminderId; }
    public void setReminderId(Integer reminderId) { this.reminderId = reminderId; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public ReminderChannel getChannel() { return channel; }
    public void setChannel(ReminderChannel channel) { this.channel = channel; }
}
