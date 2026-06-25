package cms.app.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cms.app.Entity.HealthMetric;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Integer> {

    /** Lấy toàn bộ lịch sử chỉ số của bệnh nhân, mới nhất trước */
    @Query("""
        SELECT h FROM HealthMetric h
        JOIN FETCH h.patient p
        WHERE p.patientId = :patientId
        ORDER BY h.measuredAt DESC
        """)
    List<HealthMetric> findByPatientId(@Param("patientId") Integer patientId);

    /** Lọc theo khoảng thời gian */
    @Query("""
        SELECT h FROM HealthMetric h
        JOIN FETCH h.patient p
        WHERE p.patientId = :patientId
          AND h.measuredAt >= :from
          AND h.measuredAt <= :to
        ORDER BY h.measuredAt DESC
        """)
    List<HealthMetric> findByPatientIdAndDateRange(
            @Param("patientId") Integer patientId,
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to);

    /** Lấy chỉ số mới nhất có huyết áp */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.systolicBp IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithBp(@Param("patientId") Integer patientId);

    /** Lấy chỉ số mới nhất có nhịp tim */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.heartRate IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithHeartRate(@Param("patientId") Integer patientId);

    /** Lấy chỉ số mới nhất có cân nặng */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.weight IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithWeight(@Param("patientId") Integer patientId);

    /** Lấy chỉ số mới nhất có nhiệt độ */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.temperature IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithTemperature(@Param("patientId") Integer patientId);

    /** Lấy chỉ số mới nhất có đường huyết */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.bloodGlucose IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithBloodGlucose(@Param("patientId") Integer patientId);

    /** Lấy chỉ số mới nhất có SpO2 */
    @Query("""
        SELECT h FROM HealthMetric h
        WHERE h.patient.patientId = :patientId
          AND h.spO2 IS NOT NULL
        ORDER BY h.measuredAt DESC
        LIMIT 1
        """)
    Optional<HealthMetric> findLatestWithSpO2(@Param("patientId") Integer patientId);
}
