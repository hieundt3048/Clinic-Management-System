package cms.app.Service;

import java.time.LocalDate;
import java.util.List;

import cms.app.Dto.DoctorResponse;
import cms.app.Dto.ServiceCatalogResponse;
import cms.app.Dto.SpecialtyResponse;
import cms.app.Dto.TimeSlotResponse;

public interface ICatalogService {
    List<SpecialtyResponse> getAllSpecialties();
    List<DoctorResponse> getDoctorsBySpecialty(Integer specialtyId);
    List<ServiceCatalogResponse> getExamServices();
    List<TimeSlotResponse> getAvailableSlots(Integer doctorId, LocalDate date);
}
