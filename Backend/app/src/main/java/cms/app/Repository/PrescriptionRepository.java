package cms.app.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

    /** Lấy đơn thuốc kèm details — tránh N+1 */
    @Query("""
        SELECT p FROM Prescription p
        LEFT JOIN FETCH p.details
        WHERE p.prescriptionId = :id
        """)
    Optional<Prescription> findByIdWithDetails(@Param("id") Integer id);

    /** Lấy tất cả đơn thuốc của một bệnh án */
    @Query("""
        SELECT p FROM Prescription p
        LEFT JOIN FETCH p.details
        WHERE p.medicalRecord.recordId = :recordId
        ORDER BY p.createdAt DESC
        """)
    List<Prescription> findByRecordId(@Param("recordId") Integer recordId);

    /** Lấy tất cả đơn thuốc của một bệnh nhân */
    @Query("""
        SELECT p FROM Prescription p
        LEFT JOIN FETCH p.details
        JOIN p.medicalRecord r
        WHERE r.patient.patientId = :patientId
        ORDER BY p.createdAt DESC
        """)
    List<Prescription> findByPatientId(@Param("patientId") Integer patientId);
}
