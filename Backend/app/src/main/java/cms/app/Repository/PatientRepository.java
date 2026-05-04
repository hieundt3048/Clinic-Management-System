package cms.app.Repository;
import java.util.Optional;

import cms.app.Entity.Patient;

public interface PatientRepository {

    Optional<Patient> findById(Integer id);
}
