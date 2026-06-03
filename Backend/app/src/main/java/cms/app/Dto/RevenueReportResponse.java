package cms.app.Dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO tổng hợp toàn bộ báo cáo doanh thu.
 */
public class RevenueReportResponse {

    /** Chu kỳ báo cáo: DAY / WEEK / MONTH / YEAR */
    private String period;

    /** Mô tả khoảng thời gian */
    private String periodLabel;

    /** Tổng doanh thu (chỉ tính hóa đơn PAID) */
    private BigDecimal totalRevenue;

    /** Tổng số hóa đơn đã thanh toán */
    private int totalInvoicesPaid;

    /** Tổng số hóa đơn chưa thanh toán */
    private int totalInvoicesUnpaid;

    /** Doanh thu trung bình mỗi hóa đơn */
    private BigDecimal averageInvoiceValue;

    /** Doanh thu theo từng bác sĩ */
    private List<DoctorRevenueDto> revenueByDoctor;

    /** Doanh thu theo từng chuyên khoa */
    private List<SpecialtyRevenueDto> revenueBySpecialty;

    /** Doanh thu theo từng ngày trong kỳ */
    private List<DailyRevenueDto> revenueByDate;


    public RevenueReportResponse() {}


    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getPeriodLabel() { return periodLabel; }
    public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public int getTotalInvoicesPaid() { return totalInvoicesPaid; }
    public void setTotalInvoicesPaid(int totalInvoicesPaid) { this.totalInvoicesPaid = totalInvoicesPaid; }

    public int getTotalInvoicesUnpaid() { return totalInvoicesUnpaid; }
    public void setTotalInvoicesUnpaid(int totalInvoicesUnpaid) { this.totalInvoicesUnpaid = totalInvoicesUnpaid; }

    public BigDecimal getAverageInvoiceValue() { return averageInvoiceValue; }
    public void setAverageInvoiceValue(BigDecimal averageInvoiceValue) { this.averageInvoiceValue = averageInvoiceValue; }

    public List<DoctorRevenueDto> getRevenueByDoctor() { return revenueByDoctor; }
    public void setRevenueByDoctor(List<DoctorRevenueDto> revenueByDoctor) { this.revenueByDoctor = revenueByDoctor; }

    public List<SpecialtyRevenueDto> getRevenueBySpecialty() { return revenueBySpecialty; }
    public void setRevenueBySpecialty(List<SpecialtyRevenueDto> revenueBySpecialty) { this.revenueBySpecialty = revenueBySpecialty; }

    public List<DailyRevenueDto> getRevenueByDate() { return revenueByDate; }
    public void setRevenueByDate(List<DailyRevenueDto> revenueByDate) { this.revenueByDate = revenueByDate; }
}
