package cms.app.Service.Factory;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;
import cms.app.Exception.BusinessLogicException;

@Component // Đánh dấu là Bean để Spring tiêm (inject) vào Service
public class StandardAppointmentFactory implements AppointmentFactory {

    @Override
    public Appointment createPendingAppointment(Patient patient, Doctor doctor, 
                                                Specialty specialty, LocalDateTime appointmentDate, 
                                                String reason) {
        // 1. Validate dữ liệu đầu vào NGAY TẠI ĐÂY
        validateParameters(patient, doctor, specialty, appointmentDate);

        // 2. Khởi tạo đối tượng (Ở đây bạn dùng Builder hoặc Setters đều được, vì nó đã bị đóng gói kín trong Factory)
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSpecialty(specialty);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setReason(reason != null ? reason.trim() : "Không ghi rõ lý do"); // Xử lý logic format data
        
        // CÁC GIÁ TRỊ MẶC ĐỊNH CHO MỘT LỊCH KHÁM MỚI
        appointment.setStatus(AppointmentStatus.PENDING); 
        appointment.setFollowUp(false);
        
        return appointment;
    }

    private void validateParameters(Patient patient, Doctor doctor, Specialty specialty, LocalDateTime appointmentDate) {
        if (patient == null || doctor == null || specialty == null) {
            throw new IllegalArgumentException("Thông tin bệnh nhân, bác sĩ hoặc chuyên khoa không được để trống");
        }
        
        if (appointmentDate == null) {
            throw new IllegalArgumentException("Thời gian đặt lịch không được để trống");
        }
        
        if (appointmentDate.isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Không thể đặt lịch vào thời gian trong quá khứ!");
        }
    }
}