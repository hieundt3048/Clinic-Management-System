package cms.app.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.DoctorResponse;
import cms.app.Dto.ServiceCatalogResponse;
import cms.app.Dto.SpecialtyResponse;
import cms.app.Dto.TimeSlotResponse;
import cms.app.Entity.Appointment;
import cms.app.Entity.Doctor;
import cms.app.Entity.ServiceCatalog.ServiceType;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.ServiceCatalogRepository;
import cms.app.Repository.SpecialtyRepository;

@Service
public class CatalogService implements ICatalogService {

    private static final LocalTime WORK_START = LocalTime.of(8, 0);
    private static final LocalTime WORK_END = LocalTime.of(17, 0);
    private static final int SLOT_MINUTES = 30;

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final AppointmentRepository appointmentRepository;

    public CatalogService(
            SpecialtyRepository specialtyRepository,
            DoctorRepository doctorRepository,
            ServiceCatalogRepository serviceCatalogRepository,
            AppointmentRepository appointmentRepository) {
        this.specialtyRepository = specialtyRepository;
        this.doctorRepository = doctorRepository;
        this.serviceCatalogRepository = serviceCatalogRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(s -> new SpecialtyResponse(s.getSpecialtyId(), s.getSpecialtyName(), s.getDescription()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsBySpecialty(Integer specialtyId) {
        if (!specialtyRepository.existsById(specialtyId)) {
            throw new ResourceNotFoundException("Không tìm thấy chuyên khoa: " + specialtyId);
        }
        return doctorRepository.findBySpecialty_SpecialtyId(specialtyId).stream()
                .map(this::toDoctorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceCatalogResponse> getExamServices() {
        return serviceCatalogRepository.findByServiceType(ServiceType.CLINICAL).stream()
                .map(s -> new ServiceCatalogResponse(
                        s.getServiceId(), s.getServiceName(), s.getBasePrice(), s.getDescription()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getAvailableSlots(Integer doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Không tìm thấy bác sĩ: " + doctorId);
        }
        if (date.isBefore(LocalDate.now())) {
            return List.of();
        }

        List<TimeSlotResponse> slots = new ArrayList<>();
        LocalTime time = WORK_START;
        LocalDateTime now = LocalDateTime.now();

        while (time.isBefore(WORK_END)) {
            LocalDateTime slotStart = date.atTime(time);
            LocalDateTime slotEnd = slotStart.plusMinutes(SLOT_MINUTES);
            boolean inPast = slotStart.isBefore(now);
            boolean booked = !appointmentRepository
                    .findOverlappingAppointments(doctorId, slotStart, slotEnd)
                    .isEmpty();
            boolean available = !inPast && !booked;
            slots.add(new TimeSlotResponse(time.toString(), available));
            time = time.plusMinutes(SLOT_MINUTES);
        }
        return slots;
    }

    private DoctorResponse toDoctorResponse(Doctor d) {
        return new DoctorResponse(
                d.getDoctorId(),
                d.getFullName(),
                d.getRoomNumber(),
                d.getSpecialty().getSpecialtyId(),
                d.getSpecialty().getSpecialtyName());
    }
}
