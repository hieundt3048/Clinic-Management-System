package cms.app.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.MedicalRecord;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {

    @Query("""
        SELECT m FROM MedicalRecord m
        JOIN FETCH m.patient p
        JOIN FETCH m.doctor d
        WHERE p.patientId = :patientId
          AND m.recommendedFollowUpDate IS NOT NULL
          AND m.recommendedFollowUpDate >= :fromDate
          AND m.recommendedFollowUpDate <= :toDate
        ORDER BY m.recommendedFollowUpDate ASC
        """)
    List<MedicalRecord> findRecommendedFollowUpsForPatient(
            @Param("patientId") Integer patientId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
        SELECT m FROM MedicalRecord m
        JOIN FETCH m.patient p
        JOIN FETCH m.doctor d
        WHERE m.recommendedFollowUpDate IS NOT NULL
          AND m.recommendedFollowUpDate >= :fromDate
          AND m.recommendedFollowUpDate <= :toDate
        ORDER BY m.recommendedFollowUpDate ASC
        """)
    List<MedicalRecord> findRecommendedFollowUpsDueBetween(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
    /** Load kèm patient và doctor để map DTO không cần thêm query */
    @Query("""
        SELECT r FROM MedicalRecord r
        JOIN FETCH r.patient
        JOIN FETCH r.doctor
        WHERE r.recordId = :recordId
        """)
    Optional<MedicalRecord> findByIdWithDetails(@Param("recordId") Integer recordId);

    // Lấy tất cả bệnh án theo bác sĩ (để hiển thị danh sách chọn khi kê đơn)
    @Query("""
        SELECT m FROM MedicalRecord m
        JOIN FETCH m.patient
        JOIN FETCH m.doctor
        WHERE m.doctor.doctorId = :doctorId
        ORDER BY m.createdAt DESC
        """)
    List<MedicalRecord> findByDoctorId(@Param("doctorId") Integer doctorId);
    
    // Kiểm tra appointment đã có bệnh án chưa (tránh tạo trùng)
    boolean existsByAppointment_AppointmentId(Integer appointmentId);
    
    // Lấy bệnh án theo patientId (cho trang Lịch sử bệnh án ở FE)
    @Query("""
        SELECT m FROM MedicalRecord m
        JOIN FETCH m.patient
        JOIN FETCH m.doctor
        WHERE m.patient.patientId = :patientId
        ORDER BY m.createdAt DESC
        """)
    List<MedicalRecord> findByPatientId(@Param("patientId") Integer patientId);
}
