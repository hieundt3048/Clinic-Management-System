package cms.app.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Prescription;
import cms.app.Entity.RefreshToken;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

}
