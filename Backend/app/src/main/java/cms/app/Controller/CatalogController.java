package cms.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.DoctorResponse;
import cms.app.Dto.ServiceCatalogResponse;
import cms.app.Dto.SpecialtyResponse;
import cms.app.Dto.TimeSlotResponse;
import cms.app.Service.ICatalogService;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final ICatalogService catalogService;

    public CatalogController(ICatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> getSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAllSpecialties()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctors(
            @RequestParam Integer specialtyId) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getDoctorsBySpecialty(specialtyId)));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceCatalogResponse>>> getServices() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getExamServices()));
    }

    @GetMapping("/time-slots")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getTimeSlots(
            @RequestParam Integer doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAvailableSlots(doctorId, date)));
    }
}
