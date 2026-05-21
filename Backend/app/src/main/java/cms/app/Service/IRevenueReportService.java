package cms.app.Service;

import cms.app.Dto.RevenueReportResponse;

import java.time.LocalDate;

/**
 * Interface cho Service báo cáo doanh thu (UC12).
 * Admin only — không cần expose cho PATIENT/DOCTOR.
 */
public interface IRevenueReportService {

    /** Báo cáo theo ngày cụ thể */
    RevenueReportResponse getReportByDay(LocalDate date);

    /** Báo cáo theo tuần (ISO week) chứa ngày được chỉ định */
    RevenueReportResponse getReportByWeek(LocalDate anyDayInWeek);

    /** Báo cáo theo tháng */
    RevenueReportResponse getReportByMonth(int year, int month);

    /** Báo cáo theo năm */
    RevenueReportResponse getReportByYear(int year);

    /** Báo cáo theo khoảng thời gian tùy chỉnh */
    RevenueReportResponse getReportByRange(LocalDate from, LocalDate to);
}
