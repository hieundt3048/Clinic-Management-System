package cms.app.Service.Factory;

import java.time.LocalDateTime;

import cms.app.Entity.Appointment;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;

public interface AppointmentFactory {
    
    /**
     * Tạo đối tượng Appointment mới (Chờ xác nhận)
     */
    Appointment createPendingAppointment(Patient patient, Doctor doctor, 
                                         Specialty specialty, LocalDateTime appointmentDate, 
                                         String reason);
                                         
    // Sau này nếu có thêm loại Lịch khám VIP, Lịch khám Tái khám, bạn có thể thêm hàm ở đây
    // Appointment createVipAppointment(...);
}