package cms.app.Repository;

import cms.app.Entity.ReminderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, Integer> {

    /**
     * Kiểm tra xem reminder này đã được gửi thành công trong khoảng thời gian chưa.
     * Dùng để tránh gửi trùng nếu scheduler chạy lại.
     */
    @Query("""
        SELECT r FROM ReminderLog r
        WHERE r.reminder.reminderId = :reminderId
          AND r.status = 'SUCCESS'
          AND r.sentAt >= :from
          AND r.sentAt <= :to
        """)
    Optional<ReminderLog> findSuccessInRange(
            @Param("reminderId") Integer reminderId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
