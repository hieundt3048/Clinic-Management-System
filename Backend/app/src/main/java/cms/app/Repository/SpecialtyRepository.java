package cms.app.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Specialty;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Integer> {
    
}
