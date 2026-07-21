package cms.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.AppNotification;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Integer> {
    List<AppNotification> findTop20ByRecipient_UserIdOrderByCreatedAtDesc(Integer userId);

    long countByRecipient_UserIdAndReadAtIsNull(Integer userId);

    Optional<AppNotification> findByNotificationIdAndRecipient_UserId(Integer notificationId, Integer userId);

    List<AppNotification> findByRecipient_UserIdAndReadAtIsNull(Integer userId);
}