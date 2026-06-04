package cms.app.Dto;

import java.time.LocalDateTime;

import cms.app.Entity.Appointment.AppointmentStatus;

/** DTO trả về sau khi đặt / hủy lịch — tránh serialize Hibernate proxy. */
public class AppointmentResponseDTO {

    private Integer appointmentId;
    private LocalDateTime appointmentDate;
    private AppointmentStatus status;
    private String reason;
    private Boolean followUp;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private String roomNumber;
    private Integer specialtyId;
    private String specialtyName;

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
