package cms.app.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Entity.Appointment;

public interface IAppointmentService {

    Appointment bookAppointment(AppointmentRequestDTO request);
    void cancelAppointment(Integer appointmentId);
}
