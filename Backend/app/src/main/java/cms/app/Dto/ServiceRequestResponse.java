package cms.app.Dto;

import cms.app.Entity.ServiceRequest.RequestStatus;

import java.time.LocalDateTime;

/** DTO trả về thông tin chỉ định cận lâm sàng */
public class ServiceRequestResponse {

    private Integer requestId;

    // Bệnh án
    private Integer recordId;

    // Bệnh nhân
    private Integer patientId;
    private String patientName;

    // Bác sĩ chỉ định
    private Integer doctorId;
    private String doctorName;

    // Dịch vụ
    private Integer serviceId;
    private String serviceName;
    private Double basePrice;

    // Chỉ định
    private String indicationReason;
    private RequestStatus status;
    private LocalDateTime createdAt;

    // Kết quả
    private String resultSummary;
    private String resultImages;
    private LocalDateTime performedAt;

    // ==================== Constructors ====================
    public ServiceRequestResponse() {}

    // ==================== Getters & Setters ====================
    public Integer getRequestId() { return requestId; }
    public void setRequestId(Integer requestId) { this.requestId = requestId; }

    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public Integer getServiceId() { return serviceId; }
    public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public String getIndicationReason() { return indicationReason; }
    public void setIndicationReason(String indicationReason) { this.indicationReason = indicationReason; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getResultSummary() { return resultSummary; }
    public void setResultSummary(String resultSummary) { this.resultSummary = resultSummary; }

    public String getResultImages() { return resultImages; }
    public void setResultImages(String resultImages) { this.resultImages = resultImages; }

    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
}
