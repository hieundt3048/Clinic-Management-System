package cms.app.Service;

import cms.app.Dto.MedicationReminderRequest;
import cms.app.Dto.MedicationReminderResponse;

import java.util.List;

/**
 * Interface cho Service nhắc lịch uống thuốc.
 */
public interface IMedicationReminderService {

    /** Bệnh nhân tạo lịch nhắc cho đơn thuốc của mình */
    MedicationReminderResponse createReminder(Integer patientId, MedicationReminderRequest request);

    /** Lấy danh sách lịch nhắc đang hoạt động của bệnh nhân */
    List<MedicationReminderResponse> getActiveReminders(Integer patientId);

    /** Bật/tắt một lịch nhắc */
    MedicationReminderResponse toggleReminder(Integer reminderId, boolean active);

    /** Xóa lịch nhắc */
    void deleteReminder(Integer reminderId);

    /**
     * Được gọi bởi Scheduler — gửi nhắc nhở cho tất cả reminder đến hạn.
     * Không expose qua API.
     */
    void sendDueReminders();
}
