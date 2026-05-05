package cms.app.Dto;

import java.time.LocalDateTime;

import cms.app.Entity.Appointment.AppointmentStatus;

//DTO trả về thông tin lịch sử đặt khám cho client.
public class AppointmentHistoryResponse {

    private Integer appointmentId;
    private LocalDateTime appointmentDate;
    private AppointmentStatus status;
    private String reason;
    private Boolean followUp;

    // Thông tin bệnh nhân
    private Integer patientId;
    private String patientName;

    // Thông tin bác sĩ
    private Integer doctorId;
    private String doctorName;
    private String roomNumber;

    // Thông tin chuyên khoa
    private Integer specialtyId;
    private String specialtyName;

    // ==================== Constructors ====================

    public AppointmentHistoryResponse() {}

    public AppointmentHistoryResponse(
            Integer appointmentId, LocalDateTime appointmentDate,
            AppointmentStatus status, String reason, Boolean followUp,
            Integer patientId, String patientName,
            Integer doctorId, String doctorName, String roomNumber,
            Integer specialtyId, String specialtyName) {
        this.appointmentId = appointmentId;
        this.appointmentDate = appointmentDate;
        this.status = status;
        this.reason = reason;
        this.followUp = followUp;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.roomNumber = roomNumber;
        this.specialtyId = specialtyId;
        this.specialtyName = specialtyName;
    }

    // ==================== Getters & Setters ====================

    public Integer getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Integer appointmentId) { this.appointmentId = appointmentId; }

    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Boolean getFollowUp() { return followUp; }
    public void setFollowUp(Boolean followUp) { this.followUp = followUp; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }

    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
}
