package cms.app.Service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceCatalog.ServiceType;
import cms.app.Repository.ServiceCatalogRepository;

@Component
public class ServiceCatalogDataInitializer {

    private final ServiceCatalogRepository serviceCatalogRepository;

    public ServiceCatalogDataInitializer(ServiceCatalogRepository serviceCatalogRepository) {
        this.serviceCatalogRepository = serviceCatalogRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedClinicalServices() {
        seed("Công thức máu", 90000.0, "Xét nghiệm tổng phân tích tế bào máu ngoại vi");
        seed("Đường huyết", 60000.0, "Định lượng glucose máu");
        seed("Tổng phân tích nước tiểu", 70000.0, "Xét nghiệm nước tiểu thường quy");
        seed("Chức năng gan", 180000.0, "Bộ xét nghiệm AST, ALT, bilirubin và chỉ số liên quan");
        seed("Chức năng thận", 160000.0, "Bộ xét nghiệm ure, creatinine và chỉ số liên quan");
        seed("Điện tâm đồ", 120000.0, "Ghi điện tim cơ bản");
        seed("X-quang ngực", 220000.0, "Chụp X-quang ngực thẳng");
        seed("Siêu âm ổ bụng", 250000.0, "Siêu âm tổng quát vùng ổ bụng");
    }

    private void seed(String name, Double price, String description) {
        ServiceCatalog service = serviceCatalogRepository
                .findFirstByServiceNameIgnoreCase(name)
                .orElseGet(ServiceCatalog::new);
        service.setServiceName(name);
        service.setBasePrice(price);
        service.setDescription(description);
        service.setServiceType(ServiceType.CLINICAL);
        serviceCatalogRepository.save(service);
    }
}