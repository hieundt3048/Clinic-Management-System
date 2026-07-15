package cms.app.Dto;

import jakarta.validation.constraints.NotNull;

/**
 * Admin tạo hóa đơn phí khám lâm sàng cho một lịch hẹn.
 * Tổng tiền được hệ thống lấy từ dịch vụ khám bệnh nhân đã chọn khi đặt lịch.
 */
public class CreateInvoiceRequest {

    @NotNull(message = "Mã lịch hẹn không được để trống")
    private Integer appointmentId;

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }
}
