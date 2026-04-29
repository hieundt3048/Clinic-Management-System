package cms.app.Repository;
import cms.app.Entity.Patient;

public interface PatientRepository {

    public Patient findById(Integer id);
}
