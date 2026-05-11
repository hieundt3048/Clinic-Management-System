package cms.app.Dto;

import java.time.LocalDateTime;

public class FollowUpReminderResponse {

    public enum ReminderKind {
        /** Ngày tái khám bác sĩ ghi trong bệnh án. */
        RECOMMENDED_FOLLOW_UP_DATE,
        /** Lịch hẹn đã đặt, đánh dấu là tái khám. */
        SCHEDULED_FOLLOW_UP_APPOINTMENT
    }

    private ReminderKind kind;
    private Integer referenceId;
    private LocalDateTime occursAt;
    private String title;
    private String detail;
    private String doctorName;
    private String patientName;

    public ReminderKind getKind() {
        return kind;
    }

    public void setKind(ReminderKind kind) {
        this.kind = kind;
    }

    public Integer getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Integer referenceId) {
        this.referenceId = referenceId;
    }

    public LocalDateTime getOccursAt() {
        return occursAt;
    }

    public void setOccursAt(LocalDateTime occursAt) {
        this.occursAt = occursAt;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
}
