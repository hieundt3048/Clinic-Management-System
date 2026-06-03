package cms.app.Dto;

import cms.app.Entity.ServiceRequest.RequestStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO cập nhật kết quả cận lâm sàng sau khi thực hiện.
 * Dùng cho nhân viên y tế / bác sĩ cập nhật kết quả.
 */
public class UpdateServiceResultDto {

    @NotNull(message = "Trạng thái không được để trống")
    private RequestStatus status;

    /** Mô tả kết quả (text) */
    private String resultSummary;

    /** URL ảnh kết quả (X-quang, siêu âm...) — nhiều URL cách nhau bằng dấu phẩy */
    private String resultImages;

    // ==================== Getters & Setters ====================
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getResultSummary() { return resultSummary; }
    public void setResultSummary(String resultSummary) { this.resultSummary = resultSummary; }

    public String getResultImages() { return resultImages; }
    public void setResultImages(String resultImages) { this.resultImages = resultImages; }
}
