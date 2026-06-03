package cms.app.Service;

import cms.app.Dto.*;
import cms.app.Repository.RevenueReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RevenueReportService implements IRevenueReportService {

    private final RevenueReportRepository reportRepo;

    public RevenueReportService(RevenueReportRepository reportRepo) {
        this.reportRepo = reportRepo;
    }

    // Báo cáo theo ngày
    @Override
    public RevenueReportResponse getReportByDay(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to   = date.atTime(LocalTime.MAX);

        String label = date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        return buildReport("DAY", label, from, to);
    }

    // Báo cáo theo tuần
    @Override
    public RevenueReportResponse getReportByWeek(LocalDate anyDayInWeek) {
        // ISO week: thứ Hai → Chủ nhật
        LocalDate monday = anyDayInWeek.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);

        LocalDateTime from = monday.atStartOfDay();
        LocalDateTime to   = sunday.atTime(LocalTime.MAX);

        int week = anyDayInWeek.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String label = String.format("Tuần %d/%d (%s - %s)",
                week, anyDayInWeek.getYear(),
                monday.format(DateTimeFormatter.ofPattern("dd/MM")),
                sunday.format(DateTimeFormatter.ofPattern("dd/MM")));

        return buildReport("WEEK", label, from, to);
    }

    // Báo cáo theo tháng───
    @Override
    public RevenueReportResponse getReportByMonth(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay  = firstDay.with(TemporalAdjusters.lastDayOfMonth());

        LocalDateTime from = firstDay.atStartOfDay();
        LocalDateTime to   = lastDay.atTime(LocalTime.MAX);

        String label = String.format("Tháng %d/%d", month, year);
        return buildReport("MONTH", label, from, to);
    }

    // Báo cáo theo năm
    @Override
    public RevenueReportResponse getReportByYear(int year) {
        LocalDateTime from = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to   = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        String label = "Năm " + year;
        return buildReport("YEAR", label, from, to);
    }

    // Báo cáo theo khoảng tuỳ chỉnh
    @Override
    public RevenueReportResponse getReportByRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.atTime(LocalTime.MAX);

        String label = String.format("%s → %s",
                from.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                to.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return buildReport("RANGE", label, fromDt, toDt);
    }

    // Core builder — dùng chung cho tất cả kỳ
    private RevenueReportResponse buildReport(String period, String label,
                                               LocalDateTime from, LocalDateTime to) {
        RevenueReportResponse report = new RevenueReportResponse();
        report.setPeriod(period);
        report.setPeriodLabel(label);

        // ── Tổng quan ──
        BigDecimal totalRevenue  = reportRepo.sumRevenue(from, to);
        int paidCount            = reportRepo.countPaidInvoices(from, to);
        int unpaidCount          = reportRepo.countUnpaidInvoices(from, to);

        report.setTotalRevenue(totalRevenue);
        report.setTotalInvoicesPaid(paidCount);
        report.setTotalInvoicesUnpaid(unpaidCount);
        report.setAverageInvoiceValue(
                paidCount > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(paidCount), 0, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO
        );

        // ── Theo bác sĩ ──
        List<DoctorRevenueDto> byDoctor = reportRepo.revenueByDoctor(from, to)
                .stream()
                .map(row -> new DoctorRevenueDto(
                        (Integer)   row[0],
                        (String)    row[1],
                        (String)    row[2],
                        (BigDecimal)row[3],
                        ((Long)     row[4]).intValue()
                ))
                .collect(Collectors.toList());
        report.setRevenueByDoctor(byDoctor);

        // ── Theo chuyên khoa ──
        List<SpecialtyRevenueDto> bySpecialty = reportRepo.revenueBySpecialty(from, to)
                .stream()
                .map(row -> new SpecialtyRevenueDto(
                        (Integer)   row[0],
                        (String)    row[1],
                        (BigDecimal)row[2],
                        ((Long)     row[3]).intValue()
                ))
                .collect(Collectors.toList());
        report.setRevenueBySpecialty(bySpecialty);

        // ── Theo ngày (trend) ──
        List<DailyRevenueDto> byDate = reportRepo.revenueByDate(from, to)
                .stream()
                .map(row -> new DailyRevenueDto(
                        ((java.sql.Date) row[0]).toLocalDate(),
                        (BigDecimal)     row[1],
                        ((Long)          row[2]).intValue()
                ))
                .collect(Collectors.toList());
        report.setRevenueByDate(byDate);

        return report;
    }
}
