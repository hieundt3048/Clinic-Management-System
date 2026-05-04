package cms.app.Repository;
import java.util.Optional;

import cms.app.Entity.Doctor;

public interface DoctorRepository {

    Optional<Doctor> findById(Integer id);
}
