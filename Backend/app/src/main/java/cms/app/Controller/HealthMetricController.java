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

/**
 * REST ControllerTheo dõi sức khỏe.
 */
@RestController
@RequestMapping("/api/health-metrics")
public class HealthMetricController {

    private final IHealthMetricService healthMetricService;

    public HealthMetricController(IHealthMetricService healthMetricService) {
        this.healthMetricService = healthMetricService;
    }

    /**
     * Bệnh nhân ghi chỉ số sức khỏe mới.
     * POST /api/health-metrics
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<HealthMetricResponse> recordMetric(
            @Valid @RequestBody HealthMetricRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(healthMetricService.recordMetric(request));
    }

    /**
     * Lấy toàn bộ lịch sử chỉ số sức khỏe của bệnh nhân.
     * GET /api/health-metrics/{patientId}
     */
    @GetMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<HealthMetricResponse>> getHistory(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(healthMetricService.getHistory(patientId));
    }

    /**
     * Lấy lịch sử theo khoảng thời gian.
     * GET /api/health-metrics/{patientId}/range?from=2026-01-01&to=2026-05-31
     */
    @GetMapping("/{patientId}/range")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<List<HealthMetricResponse>> getHistoryByRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(healthMetricService.getHistoryByDateRange(patientId, from, to));
    }

    /**
     * Lấy tổng hợp chỉ số mới nhất của bệnh nhân.
     * GET /api/health-metrics/{patientId}/summary
     */
    @GetMapping("/{patientId}/summary")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN') " +
                  "or (hasRole('PATIENT') and #patientId == authentication.principal.patientId)")
    public ResponseEntity<HealthMetricSummaryResponse> getLatestSummary(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(healthMetricService.getLatestSummary(patientId));
    }

    /**
     * Xóa một bản ghi chỉ số.
     * DELETE /api/health-metrics/{metricId}
     */
    @DeleteMapping("/{metricId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ResponseEntity<Void> deleteMetric(@PathVariable Integer metricId) {
        healthMetricService.deleteMetric(metricId);
        return ResponseEntity.noContent().build();
    }
}
