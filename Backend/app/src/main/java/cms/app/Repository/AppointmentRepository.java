package cms.app.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Appointment;


@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // Câu query kiểm tra xem bác sĩ đã có lịch nào trong khung giờ đó chưa (Giả sử 1 ca khám 30 phút)
    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId " +
           "AND a.appointmentDate >= :startTime AND a.appointmentDate <= :endTime " +
           "AND a.status != 'CANCELLED'")
    List<Appointment> findOverlappingAppointments(
            @Param("doctorId") Integer doctorId, 
            @Param("startTime") LocalDateTime startTime, 
            @Param("endTime") LocalDateTime endTime);
}
