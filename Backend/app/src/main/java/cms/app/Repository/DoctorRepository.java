package cms.app.Repository;
import cms.app.Entity.Doctor;

public interface DoctorRepository {

    public Doctor findById(Integer id);
}
