package cms.app.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;

/**
 * Repository cho chức năng lịch sử đặt khám.
 * Sử dụng JPQL với JOIN FETCH để tránh N+1 query problem.
 */
@Repository
public interface AppointmentHistoryRepository extends JpaRepository<Appointment, Integer> {

    // Queries cho PATIENT (xem lịch sử của mình)
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH a.doctor d
        JOIN FETCH d.specialty s
        WHERE p.patientId = :patientId
        ORDER BY a.appointmentDate DESC
        """)
    List<Appointment> findByPatientId(@Param("patientId") Integer patientId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH a.doctor d
        JOIN FETCH d.specialty s
        WHERE p.patientId = :patientId
          AND (:status IS NULL OR a.status = :status)
          AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
          AND (:toDate   IS NULL OR a.appointmentDate <= :toDate)
        ORDER BY a.appointmentDate DESC
        """)
    List<Appointment> findByPatientIdWithFilter(
            @Param("patientId") Integer patientId,
            @Param("status")    AppointmentStatus status,
            @Param("fromDate")  LocalDateTime fromDate,
            @Param("toDate")    LocalDateTime toDate
    );

    // Queries cho DOCTOR (xem lịch hẹn của mình)
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH a.doctor d
        JOIN FETCH d.specialty s
        WHERE d.doctorId = :doctorId
        ORDER BY a.appointmentDate DESC
        """)
    List<Appointment> findByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH a.doctor d
        JOIN FETCH d.specialty s
        WHERE d.doctorId = :doctorId
          AND (:status IS NULL OR a.status = :status)
          AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
          AND (:toDate   IS NULL OR a.appointmentDate <= :toDate)
        ORDER BY a.appointmentDate DESC
        """)
    List<Appointment> findByDoctorIdWithFilter(
            @Param("doctorId")  Integer doctorId,
            @Param("status")    AppointmentStatus status,
            @Param("fromDate")  LocalDateTime fromDate,
            @Param("toDate")    LocalDateTime toDate
    );

    // Queries cho ADMIN (xem tất cả)
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH a.doctor d
        JOIN FETCH d.specialty s
        WHERE (:status IS NULL OR a.status = :status)
          AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
          AND (:toDate   IS NULL OR a.appointmentDate <= :toDate)
        ORDER BY a.appointmentDate DESC
        """)
    List<Appointment> findAllWithFilter(
            @Param("status")   AppointmentStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate")   LocalDateTime toDate
    );
}
