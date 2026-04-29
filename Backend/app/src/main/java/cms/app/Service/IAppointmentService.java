package cms.app.Service;

import cms.app.Dto.AppointmentRequestDTO;
import cms.app.Dto.AppointmentResponseDTO;

public interface IAppointmentService {

    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request);
    void cancelAppointment(Integer appointmentId);
}
