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
    private String patientPhone;

    // Thông tin bác sĩ
    private Integer doctorId;
    private String doctorName;
    private String roomNumber;

    // Thông tin chuyên khoa
    private Integer specialtyId;
    private String specialtyName;

    // Dịch vụ khám
    private Integer serviceId;
    private String serviceName;
    private Double servicePrice;


    // ==================== Constructors ====================

    public AppointmentHistoryResponse() {}

    public AppointmentHistoryResponse(
            Integer appointmentId, LocalDateTime appointmentDate,
            AppointmentStatus status, String reason, Boolean followUp,
            Integer patientId, String patientName, String patientPhone,
            Integer doctorId, String doctorName, String roomNumber,
            Integer specialtyId, String specialtyName,
            Integer serviceId, String serviceName, Double servicePrice) {
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
        this.patientPhone = patientPhone;
        this.serviceId       = serviceId;
        this.serviceName     = serviceName;
        this.servicePrice    = servicePrice;
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

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

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

    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Double getServicePrice() { return servicePrice; }
    public void setServicePrice(Double servicePrice) { this.servicePrice = servicePrice; }

}
