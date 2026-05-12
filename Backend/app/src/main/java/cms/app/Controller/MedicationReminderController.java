package cms.app.Controller;

import cms.app.Dto.MedicationReminderRequest;
import cms.app.Dto.MedicationReminderResponse;
import cms.app.Service.IMedicationReminderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders/medication")
public class MedicationReminderController {

    private final IMedicationReminderService reminderService;

    public MedicationReminderController(IMedicationReminderService reminderService) {
        this.reminderService = reminderService;
    }

    /**
     * Tạo lịch nhắc uống thuốc mới.
     * POST /api/reminders/medication?patientId=5
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<MedicationReminderResponse> createReminder(
            @RequestParam Integer patientId,
            @Valid @RequestBody MedicationReminderRequest request) {
        MedicationReminderResponse response = reminderService.createReminder(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Xem danh sách lịch nhắc đang hoạt động của bệnh nhân.
     * GET /api/reminders/medication/{patientId}
     */
    @GetMapping("/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicationReminderResponse>> getActiveReminders(
            @PathVariable Integer patientId) {
        return ResponseEntity.ok(reminderService.getActiveReminders(patientId));
    }

    /**
     * Bật hoặc tắt một lịch nhắc.
     * PATCH /api/reminders/medication/{id}/toggle?active=false
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<MedicationReminderResponse> toggleReminder(
            @PathVariable Integer id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(reminderService.toggleReminder(id, active));
    }

    /**
     * Xóa lịch nhắc.
     * DELETE /api/reminders/medication/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReminder(@PathVariable Integer id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}
