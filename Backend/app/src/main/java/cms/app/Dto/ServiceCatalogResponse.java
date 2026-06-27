package cms.app.Dto;

public class ServiceCatalogResponse {
    private Integer serviceId;
    private String serviceName;
    private Double basePrice;
    private String description;

    public ServiceCatalogResponse(Integer serviceId, String serviceName, Double basePrice, String description) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.basePrice = basePrice;
        this.description = description;
    }

    public Integer getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }
    public Double getBasePrice() { return basePrice; }
    public String getDescription() { return description; }
}
