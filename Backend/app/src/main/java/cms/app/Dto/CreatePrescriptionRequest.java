package cms.app.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** DTO nhận yêu cầu tạo đơn thuốc mới từ bác sĩ */
public class CreatePrescriptionRequest {

    @NotNull(message = "recordId không được để trống")
    private Integer recordId;

    private String notes;

    @NotEmpty(message = "Đơn thuốc phải có ít nhất 1 loại thuốc")
    @Valid
    private List<PrescriptionDetailRequest> details;

    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<PrescriptionDetailRequest> getDetails() { return details; }
    public void setDetails(List<PrescriptionDetailRequest> details) { this.details = details; }

    // ─────────────────────────────────────────
    // Inner DTO cho từng loại thuốc
    // ─────────────────────────────────────────
    public static class PrescriptionDetailRequest {

        @NotBlank(message = "Tên thuốc không được để trống")
        private String medicineName;

        @NotBlank(message = "Liều dùng không được để trống")
        private String dosage;

        @NotBlank(message = "Tần suất dùng không được để trống")
        private String frequency;

        @NotNull(message = "Số ngày dùng không được để trống")
        @Min(value = 1, message = "Số ngày dùng phải ít nhất 1 ngày")
        private Integer durationDays;

        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public Integer getDurationDays() { return durationDays; }
        public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    }
}
