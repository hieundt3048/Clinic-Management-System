package cms.app.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.FollowUpReminderResponse;
import cms.app.Service.IFollowUpReminderService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Validated
@RestController
@RequestMapping("/api/reminders")
public class FollowUpReminderController {

    private final IFollowUpReminderService followUpReminderService;

    public FollowUpReminderController(IFollowUpReminderService followUpReminderService) {
        this.followUpReminderService = followUpReminderService;
    }

    /**
     * Danh sách nhắc tái khám trong N ngày tới (từ hôm nay): ngày đề nghị trong bệnh án + lịch tái khám đã đặt.
     */
    @GetMapping("/follow-up/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<FollowUpReminderResponse>>> getMyFollowUpReminders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "7") @Min(1) @Max(365) int daysAhead) {
        List<FollowUpReminderResponse> items =
                followUpReminderService.getMyFollowUpReminders(userDetails.getUsername(), daysAhead);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
