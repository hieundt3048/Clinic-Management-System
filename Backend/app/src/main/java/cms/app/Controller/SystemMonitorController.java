package cms.app.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.SystemMonitorResponse;
import cms.app.Service.SystemMonitorService;

@RestController
@RequestMapping("/api/admin/system-monitor")
@PreAuthorize("hasRole('ADMIN')")
public class SystemMonitorController {

    private final SystemMonitorService systemMonitorService;

    public SystemMonitorController(SystemMonitorService systemMonitorService) {
        this.systemMonitorService = systemMonitorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SystemMonitorResponse>> getSnapshot() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Lấy dữ liệu giám sát hệ thống thành công", systemMonitorService.getSnapshot()));
    }
}