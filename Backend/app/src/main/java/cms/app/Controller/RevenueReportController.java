package cms.app.Controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.RevenueReportResponse;
import cms.app.Service.IRevenueReportService;

/**
 * REST Controller cho UC12 - Báo cáo doanh thu.
 */
@RestController
@RequestMapping("/api/reports/revenue")
@PreAuthorize("hasRole('ADMIN')")
public class RevenueReportController {

    private final IRevenueReportService reportService;

    public RevenueReportController(IRevenueReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Báo cáo theo ngày.
     * GET /api/reports/revenue/day?date=2026-05-13
     * Mặc định: hôm nay nếu không truyền date.
     */
    @GetMapping("/day")
    public ResponseEntity<RevenueReportResponse> getByDay(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(reportService.getReportByDay(date));
    }

    /**
     * Báo cáo theo tuần (ISO week: Thứ Hai → Chủ nhật).
     * GET /api/reports/revenue/week?date=2026-05-13
     * Mặc định: tuần hiện tại.
     */
    @GetMapping("/week")
    public ResponseEntity<RevenueReportResponse> getByWeek(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(reportService.getReportByWeek(date));
    }

    /**
     * Báo cáo theo tháng.
     * GET /api/reports/revenue/month?year=2026&month=5
     * Mặc định: tháng hiện tại.
     */
    @GetMapping("/month")
    public ResponseEntity<RevenueReportResponse> getByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        if (year  == null) year  = now.getYear();
        if (month == null) month = now.getMonthValue();
        validateMonth(month);
        return ResponseEntity.ok(reportService.getReportByMonth(year, month));
    }

    /**
     * Báo cáo theo năm.
     * GET /api/reports/revenue/year?year=2026
     * Mặc định: năm hiện tại.
     */
    @GetMapping("/year")
    public ResponseEntity<RevenueReportResponse> getByYear(
            @RequestParam(required = false) Integer year) {
        if (year == null) year = LocalDate.now().getYear();
        return ResponseEntity.ok(reportService.getReportByYear(year));
    }

    /**
     * Báo cáo theo khoảng thời gian tuỳ chỉnh.
     * GET /api/reports/revenue/range?from=2026-01-01&to=2026-05-13
     */
    @GetMapping("/range")
    public ResponseEntity<RevenueReportResponse> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getReportByRange(from, to));
    }

    // Helper
    private void validateMonth(int month) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Tháng không hợp lệ: " + month + " (phải từ 1 đến 12)");
        }
    }
}
