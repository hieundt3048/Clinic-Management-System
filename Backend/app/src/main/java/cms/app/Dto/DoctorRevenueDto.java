package cms.app.Dto;

import java.math.BigDecimal;

/** Doanh thu theo từng bác sĩ */
public class DoctorRevenueDto {

    private Integer doctorId;
    private String doctorName;
    private String specialtyName;
    private BigDecimal totalRevenue;
    private int invoiceCount;

    public DoctorRevenueDto() {}

    public DoctorRevenueDto(Integer doctorId, String doctorName,
                             String specialtyName, BigDecimal totalRevenue, int invoiceCount) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialtyName = specialtyName;
        this.totalRevenue = totalRevenue;
        this.invoiceCount = invoiceCount;
    }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public int getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(int invoiceCount) { this.invoiceCount = invoiceCount; }
}
