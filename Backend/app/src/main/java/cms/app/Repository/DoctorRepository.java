package cms.app.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Doctor;
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    List<Doctor> findBySpecialty_SpecialtyId(Integer specialtyId);

    Optional<Doctor> findByUser_UserId(Integer userId);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.doctorId = :doctorId " +
       "AND a.status IN (cms.app.Entity.Appointment.AppointmentStatus.PENDING, " +
       "cms.app.Entity.Appointment.AppointmentStatus.CONFIRMED)")
boolean existsByDoctorIdAndPendingAppointments(@Param("doctorId") Integer doctorId);
}
