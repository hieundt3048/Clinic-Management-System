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
import cms.app.Entity.ServiceCatalog;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentHistoryRepository;

@Service
@Transactional(readOnly = true)
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

    private AppointmentHistoryResponse toResponse(Appointment a) {
        ServiceCatalog svc = a.getService(); // nullable — lịch cũ không có service

        return new AppointmentHistoryResponse(
                a.getAppointmentId(),
                a.getAppointmentDate(),
                a.getStatus(),
                a.getReason(),
                a.isFollowUp(),
                // Bệnh nhân
                a.getPatient().getPatientId(),
                a.getPatient().getFullName(),
                a.getPatient().getUser().getPhone(),        // patientPhone
                // Bác sĩ
                a.getDoctor().getDoctorId(),
                a.getDoctor().getFullName(),
                a.getDoctor().getRoomNumber(),
                // Chuyên khoa
                a.getDoctor().getSpecialty().getSpecialtyId(),
                a.getDoctor().getSpecialty().getSpecialtyName(),
                // Dịch vụ khám (null nếu lịch cũ không lưu)
                svc != null ? svc.getServiceId()   : null,
                svc != null ? svc.getServiceName() : null,
                svc != null ? svc.getBasePrice()   : null
        );
    }

    private boolean isEmptyFilter(AppointmentFilterRequest filter) {
        return filter.getStatus() == null
                && filter.getFromDate() == null
                && filter.getToDate() == null;
    }

    private LocalDateTime toStartOfDay(LocalDateTime dt) { return dt; }
    private LocalDateTime toEndOfDay(LocalDateTime dt)   { return dt; }
}
