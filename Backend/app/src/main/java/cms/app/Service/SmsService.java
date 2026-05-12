package cms.app.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import cms.app.Entity.MedicationReminder;
import jakarta.annotation.PostConstruct;

/**
 * Service gửi SMS nhắc uống thuốc qua Twilio.
 */
@Service
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    /**
     * Gửi SMS nhắc uống thuốc.
     *
     * @param reminder  thông tin lịch nhắc
     * @param toPhone   số điện thoại nhận
     */
    public void sendMedicationReminder(MedicationReminder reminder, String toPhone) {
        String body = buildSmsContent(reminder);

        Message.creator(
                new PhoneNumber(toPhone),
                new PhoneNumber(fromNumber),
                body
        ).create();
    }

    private String buildSmsContent(MedicationReminder reminder) {
        StringBuilder sb = new StringBuilder();
        sb.append("[CMS] Nhắc uống thuốc lúc ")
          .append(reminder.getReminderTime())
          .append(" - Đơn #").append(reminder.getPrescription().getPrescriptionId());

        if (reminder.getNote() != null && !reminder.getNote().isBlank()) {
            sb.append(". Lưu ý: ").append(reminder.getNote());
        }

        return sb.toString();
    }
}
