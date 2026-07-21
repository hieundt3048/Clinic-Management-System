package cms.app.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.HealthMetricRequest;
import cms.app.Dto.HealthMetricResponse;
import cms.app.Dto.HealthMetricSummaryResponse;
import cms.app.Service.IHealthMetricService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/health-metrics")
public class HealthMetricController {

    private final IHealthMetricService healthMetricService;

    public HealthMetricController(IHealthMetricService healthMetricService) {
        this.healthMetricService = healthMetricService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<HealthMetricResponse> recordMetric(
            @Valid @RequestBody HealthMetricRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(healthMetricService.recordMetric(request));
    }

    @GetMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<HealthMetricResponse>> getHistory(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(healthMetricService.getHistory(patientId));
    }

    @GetMapping("/{patientId}/range")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<HealthMetricResponse>> getHistoryByRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(healthMetricService.getHistoryByDateRange(patientId, from, to));
    }

    @GetMapping("/{patientId}/summary")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<HealthMetricSummaryResponse> getLatestSummary(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(healthMetricService.getLatestSummary(patientId));
    }

    @DeleteMapping("/{metricId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteMetric(@PathVariable Integer metricId) {
        healthMetricService.deleteMetric(metricId);
        return ResponseEntity.noContent().build();
    }
}
