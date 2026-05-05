package cms.app.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Doctor;
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

}
