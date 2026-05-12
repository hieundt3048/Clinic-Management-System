package cms.app.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import cms.app.Entity.MedicationReminder;

/**
 * Service gửi email nhắc uống thuốc.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi email nhắc uống thuốc cho bệnh nhân.
     *
     * @param reminder thông tin lịch nhắc
     * @param toEmail  địa chỉ email nhận
     */
    public void sendMedicationReminder(MedicationReminder reminder, String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Nhắc nhở uống thuốc - Phòng khám CMS");
        message.setText(buildEmailContent(reminder));
        mailSender.send(message);
    }

    private String buildEmailContent(MedicationReminder reminder) {
        StringBuilder sb = new StringBuilder();
        sb.append("Xin chào ").append(reminder.getPatient().getFullName()).append(",\n\n");
        sb.append("Đây là nhắc nhở uống thuốc của bạn lúc ")
          .append(reminder.getReminderTime()).append(".\n\n");

        if (reminder.getNote() != null && !reminder.getNote().isBlank()) {
            sb.append("Lưu ý: ").append(reminder.getNote()).append("\n\n");
        }

        sb.append("Thuốc theo đơn số #").append(reminder.getPrescription().getPrescriptionId()).append(".\n");
        sb.append("Vui lòng uống thuốc đúng giờ để đảm bảo hiệu quả điều trị.\n\n");
        sb.append("Trân trọng,\n");
        sb.append("Phòng khám CMS");
        return sb.toString();
    }
}
