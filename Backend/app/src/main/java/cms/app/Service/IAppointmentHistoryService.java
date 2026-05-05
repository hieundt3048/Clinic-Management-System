package cms.app.Service;

import java.util.List;

import cms.app.Dto.AppointmentFilterRequest;
import cms.app.Dto.AppointmentHistoryResponse;

//Interface cho Service lịch sử đặt khám.
public interface IAppointmentHistoryService {

    //Lấy lịch sử đặt khám của một bệnh nhân.
    List<AppointmentHistoryResponse> getHistoryByPatient(Integer patientId, AppointmentFilterRequest filter);

    // Lấy danh sách lịch hẹn của một bác sĩ.
    List<AppointmentHistoryResponse> getHistoryByDoctor(Integer doctorId, AppointmentFilterRequest filter);

    // Lấy toàn bộ lịch sử đặt khám trong hệ thống.
    List<AppointmentHistoryResponse> getAllHistory(AppointmentFilterRequest filter);
}
