package cms.app.Dto;

import java.math.BigDecimal;

/** Doanh thu theo từng chuyên khoa */
public class SpecialtyRevenueDto {

    private Integer specialtyId;
    private String specialtyName;
    private BigDecimal totalRevenue;
    private int invoiceCount;

    public SpecialtyRevenueDto() {}

    public SpecialtyRevenueDto(Integer specialtyId, String specialtyName,
                                BigDecimal totalRevenue, int invoiceCount) {
        this.specialtyId = specialtyId;
        this.specialtyName = specialtyName;
        this.totalRevenue = totalRevenue;
        this.invoiceCount = invoiceCount;
    }

    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }
    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public int getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(int invoiceCount) { this.invoiceCount = invoiceCount; }
}
