package cms.app.Dto;

import java.time.LocalDateTime;
import java.util.List;

/** DTO trả về thông tin đơn thuốc */
public class PrescriptionResponse {

    private Integer prescriptionId;
    private Integer recordId;

    // Thông tin bệnh nhân
    private Integer patientId;
    private String patientName;

    // Thông tin bác sĩ
    private Integer doctorId;
    private String doctorName;

    private LocalDateTime createdAt;
    private String notes;
    private List<PrescriptionDetailResponse> details;

    public PrescriptionResponse() {}

    public Integer getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Integer prescriptionId) { this.prescriptionId = prescriptionId; }
    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer recordId) { this.recordId = recordId; }
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<PrescriptionDetailResponse> getDetails() { return details; }
    public void setDetails(List<PrescriptionDetailResponse> details) { this.details = details; }

    // ─────────────────────────────────────────
    // Inner DTO cho từng loại thuốc
    // ─────────────────────────────────────────
    public static class PrescriptionDetailResponse {

        private Integer detailId;
        private String medicineName;
        private String dosage;
        private String frequency;
        private Integer durationDays;

        public PrescriptionDetailResponse() {}

        public Integer getDetailId() { return detailId; }
        public void setDetailId(Integer detailId) { this.detailId = detailId; }
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
