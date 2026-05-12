package cms.app.Repository;

import cms.app.Entity.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, Integer> {

    /** Lấy tất cả nhắc nhở đang hoạt động của một bệnh nhân */
    @Query("""
        SELECT r FROM MedicationReminder r
        JOIN FETCH r.prescription p
        JOIN FETCH r.patient pt
        WHERE pt.patientId = :patientId
          AND r.active = true
        ORDER BY r.reminderTime ASC
        """)
    List<MedicationReminder> findActiveByPatientId(@Param("patientId") Integer patientId);

    /**
     * Lấy các reminder cần gửi tại thời điểm hiện tại.
     * Được gọi bởi @Scheduled mỗi phút.
     * Điều kiện: active=true, hôm nay nằm trong [startDate, endDate], giờ khớp reminderTime.
     */
    @Query("""
        SELECT r FROM MedicationReminder r
        JOIN FETCH r.patient pt
        JOIN FETCH r.prescription p
        WHERE r.active = true
          AND :today BETWEEN r.startDate AND r.endDate
          AND r.reminderTime = :currentTime
        """)
    List<MedicationReminder> findDueReminders(
            @Param("today") LocalDate today,
            @Param("currentTime") LocalTime currentTime
    );

    /** Kiểm tra bệnh nhân đã có reminder cho đơn thuốc này chưa */
    boolean existsByPrescriptionPrescriptionIdAndPatientPatientId(
            Integer prescriptionId, Integer patientId);
}
