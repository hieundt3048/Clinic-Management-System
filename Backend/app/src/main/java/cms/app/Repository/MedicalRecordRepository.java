package cms.app.Repository;

import java.time.LocalDate;
import java.util.List;

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
}
