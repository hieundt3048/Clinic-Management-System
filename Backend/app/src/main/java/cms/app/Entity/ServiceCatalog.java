package cms.app.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Danh mục dịch vụ của phòng khám. UC10 chỉ dùng các dịch vụ có loại CLINICAL.
@Entity
@Table(name = "services")
public class ServiceCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer serviceId;

    @Column(columnDefinition = "NVARCHAR(100)", nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private Double basePrice;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ServiceType serviceType = ServiceType.CLINICAL;

    public enum ServiceType {
        CLINICAL,
        CONSULTATION
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }
}