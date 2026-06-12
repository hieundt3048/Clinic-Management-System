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

    // ── Helper: SQL Server trả Double hoặc BigDecimal tuỳ query → normalize về BigDecimal ──
    private BigDecimal toBigDecimal(Object value) {
        if (value == null)                    return BigDecimal.ZERO;
        if (value instanceof BigDecimal)      return (BigDecimal) value;
        if (value instanceof Double)          return BigDecimal.valueOf((Double) value);
        if (value instanceof Float)           return BigDecimal.valueOf(((Float) value).doubleValue());
        if (value instanceof Long)            return BigDecimal.valueOf((Long) value);
        if (value instanceof Integer)         return BigDecimal.valueOf((Integer) value);
        return new BigDecimal(value.toString());
    }

    private int toInt(Object value) {
        if (value == null)               return 0;
        if (value instanceof Long)       return ((Long) value).intValue();
        if (value instanceof Integer)    return (Integer) value;
        if (value instanceof BigDecimal) return ((BigDecimal) value).intValue();
        return Integer.parseInt(value.toString());
    }

    @Override
    public RevenueReportResponse getReportByDay(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to   = date.atTime(LocalTime.MAX);
        return buildReport("DAY",
                date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                from, to);
    }

    @Override
    public RevenueReportResponse getReportByWeek(LocalDate anyDayInWeek) {
        LocalDate monday = anyDayInWeek.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        int week = anyDayInWeek.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String label = String.format("Tuần %d/%d (%s - %s)",
                week, anyDayInWeek.getYear(),
                monday.format(DateTimeFormatter.ofPattern("dd/MM")),
                sunday.format(DateTimeFormatter.ofPattern("dd/MM")));
        return buildReport("WEEK", label, monday.atStartOfDay(), sunday.atTime(LocalTime.MAX));
    }

    @Override
    public RevenueReportResponse getReportByMonth(int year, int month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay  = firstDay.with(TemporalAdjusters.lastDayOfMonth());
        return buildReport("MONTH",
                String.format("Tháng %d/%d", month, year),
                firstDay.atStartOfDay(), lastDay.atTime(LocalTime.MAX));
    }

    @Override
    public RevenueReportResponse getReportByYear(int year) {
        return buildReport("YEAR", "Năm " + year,
                LocalDate.of(year, 1, 1).atStartOfDay(),
                LocalDate.of(year, 12, 31).atTime(LocalTime.MAX));
    }

    @Override
    public RevenueReportResponse getReportByRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from))
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        String label = String.format("%s → %s",
                from.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                to.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        return buildReport("RANGE", label, from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    private RevenueReportResponse buildReport(String period, String label,
                                               LocalDateTime from, LocalDateTime to) {
        RevenueReportResponse report = new RevenueReportResponse();
        report.setPeriod(period);
        report.setPeriodLabel(label);

        // ── Tổng quan ──
        // sumRevenue có thể trả null (chưa có hóa đơn nào), Double hoặc BigDecimal
        BigDecimal totalRevenue = toBigDecimal(reportRepo.sumRevenue(from, to));
        int paidCount   = reportRepo.countPaidInvoices(from, to);
        int unpaidCount = reportRepo.countUnpaidInvoices(from, to);

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
                        (Integer)        row[0],
                        (String)         row[1],
                        (String)         row[2],
                        toBigDecimal(    row[3]),   // ← dùng helper thay vì cast trực tiếp
                        toInt(           row[4])
                ))
                .collect(Collectors.toList());
        report.setRevenueByDoctor(byDoctor);

        // ── Theo chuyên khoa ──
        List<SpecialtyRevenueDto> bySpecialty = reportRepo.revenueBySpecialty(from, to)
                .stream()
                .map(row -> new SpecialtyRevenueDto(
                        (Integer)        row[0],
                        (String)         row[1],
                        toBigDecimal(    row[2]),
                        toInt(           row[3])
                ))
                .collect(Collectors.toList());
        report.setRevenueBySpecialty(bySpecialty);

        // ── Theo ngày (trend) ──
        List<DailyRevenueDto> byDate = reportRepo.revenueByDate(from, to)
                .stream()
                .map(row -> new DailyRevenueDto(
                        ((java.sql.Date) row[0]).toLocalDate(),
                        toBigDecimal(    row[1]),
                        toInt(           row[2])
                ))
                .collect(Collectors.toList());
        report.setRevenueByDate(byDate);

        return report;
    }
}
