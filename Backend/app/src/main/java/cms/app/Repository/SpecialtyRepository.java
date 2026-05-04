package cms.app.Repository;

import java.util.Optional;

import cms.app.Entity.Specialty;

public interface SpecialtyRepository {

    Optional<Specialty> findById(Integer id);
}
