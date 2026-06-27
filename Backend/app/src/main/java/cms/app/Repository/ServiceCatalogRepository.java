package cms.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceCatalog.ServiceType;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Integer> {
    List<ServiceCatalog> findByServiceType(ServiceType serviceType);
    Optional<ServiceCatalog> findFirstByServiceNameIgnoreCase(String serviceName);
}