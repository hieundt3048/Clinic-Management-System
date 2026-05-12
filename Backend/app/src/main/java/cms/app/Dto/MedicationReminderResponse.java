package cms.app.Dto;

import cms.app.Entity.MedicationReminder.ReminderChannel;

import java.time.LocalDate;
import java.time.LocalTime;

/** DTO trả về thông tin lịch nhắc uống thuốc */
public class MedicationReminderResponse {

    private Integer reminderId;
    private Integer prescriptionId;
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private LocalTime reminderTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private String note;
    private boolean active;
    private ReminderChannel channel;

    // ==================== Constructors ====================

    public MedicationReminderResponse() {}

    public MedicationReminderResponse(Integer reminderId, Integer prescriptionId,
                                       Integer patientId, String patientName, String patientEmail,
                                       LocalTime reminderTime, LocalDate startDate, LocalDate endDate,
                                       String note, boolean active, ReminderChannel channel) {
        this.reminderId = reminderId;
        this.prescriptionId = prescriptionId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientEmail = patientEmail;
        this.reminderTime = reminderTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.note = note;
        this.active = active;
        this.channel = channel;
    }

    // ==================== Getters & Setters ====================

    public Integer getReminderId() { return reminderId; }
    public void setReminderId(Integer reminderId) { this.reminderId = reminderId; }

    public Integer getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Integer prescriptionId) { this.prescriptionId = prescriptionId; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

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
