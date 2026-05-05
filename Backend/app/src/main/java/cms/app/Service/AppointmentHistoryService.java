package cms.app.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.AppointmentFilterRequest;
import cms.app.Dto.AppointmentHistoryResponse;
import cms.app.Entity.Appointment;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentHistoryRepository;

//Xử lý logic lấy lịch sử đặt khám cho từng role.
@Service
@Transactional(readOnly = true) //Đánh dấu toàn bộ service này là read-only, chỉ có các method cụ thể mới có @Transactional để ghi dữ liệu.
public class AppointmentHistoryService implements IAppointmentHistoryService {

    private final AppointmentHistoryRepository appointmentRepo;

    public AppointmentHistoryService(AppointmentHistoryRepository appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }

    @Override
    public List<AppointmentHistoryResponse> getHistoryByPatient(Integer patientId, AppointmentFilterRequest filter) {
        List<Appointment> appointments;

        if (filter == null || isEmptyFilter(filter)) {
            appointments = appointmentRepo.findByPatientId(patientId);
        } else {
            appointments = appointmentRepo.findByPatientIdWithFilter(
                    patientId,
                    filter.getStatus(),
                    toStartOfDay(filter.getFromDate() != null ? filter.getFromDate().atStartOfDay() : null),
                    toEndOfDay(filter.getToDate() != null ? filter.getToDate().atTime(LocalTime.MAX) : null)
            );
        }

        if (appointments.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy lịch sử đặt khám cho bệnh nhân ID: " + patientId);
        }

        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentHistoryResponse> getHistoryByDoctor(Integer doctorId, AppointmentFilterRequest filter) {
        List<Appointment> appointments;

        if (filter == null || isEmptyFilter(filter)) {
            appointments = appointmentRepo.findByDoctorId(doctorId);
        } else {
            appointments = appointmentRepo.findByDoctorIdWithFilter(
                    doctorId,
                    filter.getStatus(),
                    toStartOfDay(filter.getFromDate() != null ? filter.getFromDate().atStartOfDay() : null),
                    toEndOfDay(filter.getToDate() != null ? filter.getToDate().atTime(LocalTime.MAX) : null)
            );
        }

        if (appointments.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy lịch hẹn cho bác sĩ ID: " + doctorId);
        }

        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentHistoryResponse> getAllHistory(AppointmentFilterRequest filter) {
        List<Appointment> appointments = appointmentRepo.findAllWithFilter(
                filter != null ? filter.getStatus() : null,
                filter != null && filter.getFromDate() != null ? filter.getFromDate().atStartOfDay() : null,
                filter != null && filter.getToDate() != null ? filter.getToDate().atTime(LocalTime.MAX) : null
        );

        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map từ Appointment Entity sang DTO response.
     * Tách riêng để dễ bảo trì và test.
     */
    private AppointmentHistoryResponse toResponse(Appointment a) {
        return new AppointmentHistoryResponse(
                a.getAppointmentId(),
                a.getAppointmentDate(),
                a.getStatus(),
                a.getReason(),
                a.isFollowUp(),
                a.getPatient().getPatientId(),
                a.getPatient().getFullName(),
                a.getDoctor().getDoctorId(),
                a.getDoctor().getFullName(),
                a.getDoctor().getRoomNumber(),
                a.getDoctor().getSpecialty().getSpecialtyId(),
                a.getDoctor().getSpecialty().getSpecialtyName()
        );
    }

    // Kiểm tra filter có rỗng không — nếu rỗng dùng query đơn giản hơn
    private boolean isEmptyFilter(AppointmentFilterRequest filter) {
        return filter.getStatus() == null
                && filter.getFromDate() == null
                && filter.getToDate() == null;
    }

    private LocalDateTime toStartOfDay(LocalDateTime dt) {
        return dt;
    }

    private LocalDateTime toEndOfDay(LocalDateTime dt) {
        return dt;
    }
}
