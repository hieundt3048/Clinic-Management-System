package cms.app.Service;

import java.time.format.DateTimeFormatter;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import cms.app.Entity.MedicationReminder;

/**
 * Service gửi email nhắc uống thuốc.
 */
@Service
public class EmailService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

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
        message.setSubject("An Khang Care - Nhắc uống thuốc");
        message.setText(buildEmailContent(reminder));
        mailSender.send(message);
    }

    private String buildEmailContent(MedicationReminder reminder) {
        String patientName = reminder.getPatient().getFullName();
        String reminderTime = reminder.getReminderTime().format(TIME_FORMAT);

        StringBuilder sb = new StringBuilder();
        sb.append("Xin chào ").append(patientName).append(",\n\n");
        sb.append("An Khang Care nhắc bạn đã đến giờ uống thuốc lúc ")
          .append(reminderTime)
          .append(".\n\n");
        sb.append("Vui lòng dùng thuốc theo đúng hướng dẫn của bác sĩ để quá trình điều trị đạt hiệu quả tốt nhất.\n");
        sb.append("Nếu bạn đã uống thuốc, có thể bỏ qua thông báo này.\n\n");

        if (reminder.getNote() != null && !reminder.getNote().isBlank()) {
            sb.append("Ghi chú của bạn: ").append(reminder.getNote().trim()).append("\n\n");
        }

        sb.append("Chúc bạn nhiều sức khỏe,\n");
        sb.append("An Khang Care\n");
        sb.append("Chăm sóc trọn vẹn");
        return sb.toString();
    }
}