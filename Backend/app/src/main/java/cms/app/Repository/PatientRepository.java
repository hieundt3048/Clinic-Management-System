package cms.app.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {

}
