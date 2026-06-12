package cms.app.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;
import cms.app.Entity.Appointment;

public interface IAppointmentService {

    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request);
    
    void cancelAppointment(Integer appointmentId);

    void updateStatus(Integer appointmentId, Appointment.AppointmentStatus status);
}
