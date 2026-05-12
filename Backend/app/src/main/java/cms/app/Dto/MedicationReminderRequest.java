package cms.app.Dto;

import cms.app.Entity.MedicationReminder.ReminderChannel;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/** DTO nhận yêu cầu tạo / cập nhật lịch nhắc uống thuốc */
public class MedicationReminderRequest {

    @NotNull(message = "prescriptionId không được để trống")
    private Integer prescriptionId;

    @NotNull(message = "Giờ nhắc không được để trống")
    private LocalTime reminderTime;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private String note;

    private ReminderChannel channel = ReminderChannel.EMAIL;

    // ==================== Getters & Setters ====================

    public Integer getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Integer prescriptionId) { this.prescriptionId = prescriptionId; }

    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public ReminderChannel getChannel() { return channel; }
    public void setChannel(ReminderChannel channel) { this.channel = channel; }
}
