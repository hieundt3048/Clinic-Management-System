package cms.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cms.app.Entity.ServiceCatalog;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Integer> {
}
