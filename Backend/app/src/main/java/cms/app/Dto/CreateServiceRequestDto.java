package cms.app.Dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * DTO bác sĩ chỉ định cận lâm sàng cho bệnh nhân.
 * Một lần chỉ định có thể gồm nhiều dịch vụ cùng lúc.
 */
public class CreateServiceRequestDto {

    @NotNull(message = "recordId không được để trống")
    private Integer recordId;

    @NotNull(message = "doctorId không được để trống")
    private Integer doctorId;

    @NotEmpty(message = "Phải chỉ định ít nhất 1 dịch vụ")
    private List<ServiceItemDto> services;

    // ==================== Getters & Setters ====================
    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public List<ServiceItemDto> getServices() { return services; }
    public void setServices(List<ServiceItemDto> services) { this.services = services; }

    public static class ServiceItemDto {

        @NotNull(message = "serviceId không được để trống")
        private Integer serviceId;

        private String indicationReason;

        public Integer getServiceId() { return serviceId; }
        public void setServiceId(Integer serviceId) { this.serviceId = serviceId; }

        public String getIndicationReason() { return indicationReason; }
        public void setIndicationReason(String indicationReason) { this.indicationReason = indicationReason; }
    }
}
