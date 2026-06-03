package cms.app;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import cms.app.Dto.RevenueReportResponse;
import cms.app.Repository.RevenueReportRepository;
import cms.app.Service.RevenueReportService;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)  // ← cho phép stub không dùng trong 1 số test
class RevenueReportServiceTest {

    @Mock
    private RevenueReportRepository reportRepo;

    @InjectMocks
    private RevenueReportService service;

    // Stub mặc định cho tất cả query — tránh NullPointerException
    @BeforeEach
    void setUp() {
        when(reportRepo.sumRevenue(any(), any())).thenReturn(BigDecimal.valueOf(5_000_000));
        when(reportRepo.countPaidInvoices(any(), any())).thenReturn(10);
        when(reportRepo.countUnpaidInvoices(any(), any())).thenReturn(3);
        when(reportRepo.revenueByDoctor(any(), any())).thenReturn(Collections.emptyList());
        when(reportRepo.revenueBySpecialty(any(), any())).thenReturn(Collections.emptyList());
        when(reportRepo.revenueByDate(any(), any())).thenReturn(Collections.emptyList());
    }

    // ─────────────────────────────────────────
    // getReportByDay
    // ─────────────────────────────────────────

    @Test
    void getReportByDay_returnsPeriodDAY() {
        RevenueReportResponse result = service.getReportByDay(LocalDate.of(2026, 5, 13));

        assertThat(result.getPeriod()).isEqualTo("DAY");
        assertThat(result.getPeriodLabel()).isEqualTo("13/05/2026");
    }

    @Test
    void getReportByDay_calculatesCorrectSummary() {
        RevenueReportResponse result = service.getReportByDay(LocalDate.of(2026, 5, 13));

        assertThat(result.getTotalRevenue()).isEqualByComparingTo(BigDecimal.valueOf(5_000_000));
        assertThat(result.getTotalInvoicesPaid()).isEqualTo(10);
        assertThat(result.getTotalInvoicesUnpaid()).isEqualTo(3);
        // Trung bình: 5_000_000 / 10 = 500_000
        assertThat(result.getAverageInvoiceValue()).isEqualByComparingTo(BigDecimal.valueOf(500_000));
    }

    @Test
    void getReportByDay_queriesCorrectTimeRange() {
        LocalDate date = LocalDate.of(2026, 5, 13);
        service.getReportByDay(date);

        verify(reportRepo).sumRevenue(
                eq(LocalDateTime.of(2026, 5, 13, 0, 0, 0)),
                any(LocalDateTime.class)
        );
    }

    // ─────────────────────────────────────────
    // getReportByWeek
    // ─────────────────────────────────────────

    @Test
    void getReportByWeek_returnsPeriodWEEK() {
        RevenueReportResponse result = service.getReportByWeek(LocalDate.of(2026, 5, 13));

        assertThat(result.getPeriod()).isEqualTo("WEEK");
        assertThat(result.getPeriodLabel()).contains("Tuần");
    }

    @Test
    void getReportByWeek_labelContainsWeekNumber() {
        RevenueReportResponse result = service.getReportByWeek(LocalDate.of(2026, 5, 13));
        // Tuần 20 của 2026
        assertThat(result.getPeriodLabel()).contains("20/2026");
    }

    // ─────────────────────────────────────────
    // getReportByMonth
    // ─────────────────────────────────────────

    @Test
    void getReportByMonth_returnsPeriodMONTH() {
        RevenueReportResponse result = service.getReportByMonth(2026, 5);

        assertThat(result.getPeriod()).isEqualTo("MONTH");
        assertThat(result.getPeriodLabel()).isEqualTo("Tháng 5/2026");
    }

    @Test
    void getReportByMonth_queriesFullMonth() {
        service.getReportByMonth(2026, 5);

        // Tháng 5: 1/5 → 31/5
        verify(reportRepo).sumRevenue(
                eq(LocalDateTime.of(2026, 5, 1, 0, 0, 0)),
                any(LocalDateTime.class)
        );
    }

    // ─────────────────────────────────────────
    // getReportByYear
    // ─────────────────────────────────────────

    @Test
    void getReportByYear_returnsPeriodYEAR() {
        RevenueReportResponse result = service.getReportByYear(2026);

        assertThat(result.getPeriod()).isEqualTo("YEAR");
        assertThat(result.getPeriodLabel()).isEqualTo("Năm 2026");
    }

    // ─────────────────────────────────────────
    // getReportByRange
    // ─────────────────────────────────────────

    @Test
    void getReportByRange_returnsPeriodRANGE() {
        RevenueReportResponse result = service.getReportByRange(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 5, 13));

        assertThat(result.getPeriod()).isEqualTo("RANGE");
        assertThat(result.getPeriodLabel()).contains("01/01/2026");
        assertThat(result.getPeriodLabel()).contains("13/05/2026");
    }

    @Test
    void getReportByRange_endBeforeStart_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> service.getReportByRange(
                LocalDate.of(2026, 5, 13),
                LocalDate.of(2026, 1, 1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ngày kết thúc");
    }

    // ─────────────────────────────────────────
    // averageInvoiceValue khi không có hóa đơn
    // ─────────────────────────────────────────

    @Test
    void getReportByDay_noPaidInvoices_averageIsZero() {
        when(reportRepo.sumRevenue(any(), any())).thenReturn(BigDecimal.ZERO);
        when(reportRepo.countPaidInvoices(any(), any())).thenReturn(0);

        RevenueReportResponse result = service.getReportByDay(LocalDate.now());

        assertThat(result.getAverageInvoiceValue()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    // ─────────────────────────────────────────
    // Verify tất cả query đều được gọi
    // ─────────────────────────────────────────

    @Test
    void buildReport_callsAllRepositoryMethods() {
        service.getReportByMonth(2026, 5);

        verify(reportRepo).sumRevenue(any(), any());
        verify(reportRepo).countPaidInvoices(any(), any());
        verify(reportRepo).countUnpaidInvoices(any(), any());
        verify(reportRepo).revenueByDoctor(any(), any());
        verify(reportRepo).revenueBySpecialty(any(), any());
        verify(reportRepo).revenueByDate(any(), any());
    }
}