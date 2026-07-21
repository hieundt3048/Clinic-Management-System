package cms.app.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.NotificationResponse;
import cms.app.Entity.AppNotification;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppNotificationRepository;
import cms.app.Repository.UserRepository;

@Service
public class NotificationService {

    private final AppNotificationRepository notificationRepo;
    private final UserRepository userRepo;

    public NotificationService(AppNotificationRepository notificationRepo,
                               UserRepository userRepo) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void notifyPatient(Patient patient, String type, String title, String message, String link) {
        if (patient == null) return;
        create(patient.getUser(), type, title, message, link);
    }

    @Transactional
    public void notifyDoctor(Doctor doctor, String type, String title, String message, String link) {
        if (doctor == null) return;
        create(doctor.getUser(), type, title, message, link);
    }

    @Transactional
    public void notifyAdmins(String type, String title, String message, String link) {
        userRepo.findByRole(User.Role.ADMIN)
                .forEach(admin -> create(admin, type, title, message, link));
    }

    @Transactional
    public void create(User recipient, String type, String title, String message, String link) {
        if (recipient == null || recipient.getUserId() == null) return;

        AppNotification notification = new AppNotification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notificationRepo.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMine(Integer userId) {
        ensureUser(userId);
        return notificationRepo.findTop20ByRecipient_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread(Integer userId) {
        ensureUser(userId);
        return notificationRepo.countByRecipient_UserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Integer userId, Integer notificationId) {
        ensureUser(userId);
        AppNotification notification = notificationRepo
                .findByNotificationIdAndRecipient_UserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo."));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
        }
        return new NotificationResponse(notificationRepo.save(notification));
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        ensureUser(userId);
        LocalDateTime now = LocalDateTime.now();
        List<AppNotification> unread = notificationRepo.findByRecipient_UserIdAndReadAtIsNull(userId);
        unread.forEach(notification -> notification.setReadAt(now));
        notificationRepo.saveAll(unread);
    }

    private void ensureUser(Integer userId) {
        if (userId == null || !userRepo.existsById(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy tài khoản nhận thông báo.");
        }
    }
}