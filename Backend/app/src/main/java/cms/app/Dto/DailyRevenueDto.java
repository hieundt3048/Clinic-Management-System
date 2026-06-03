package cms.app.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Doanh thu theo từng ngày — dùng cho biểu đồ trend */
public class DailyRevenueDto {

    private LocalDate date;
    private BigDecimal revenue;
    private int invoiceCount;

    public DailyRevenueDto() {}

    public DailyRevenueDto(LocalDate date, BigDecimal revenue, int invoiceCount) {
        this.date = date;
        this.revenue = revenue;
        this.invoiceCount = invoiceCount;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public int getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(int invoiceCount) { this.invoiceCount = invoiceCount; }
}
