package cms.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.ServiceCatalog;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Integer> {
}
