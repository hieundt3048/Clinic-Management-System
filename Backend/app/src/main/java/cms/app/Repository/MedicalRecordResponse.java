package cms.app.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Repository;

@Repository
public class MedicalRecordResponse {

    private Integer recordId;
    private Integer appointmentId;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private String diagnosis;
    private String treatmentPlan;
    private LocalDate recommendedFollowUpDate;
    private LocalDateTime createdAt;
    private boolean hasPrescription; // FE dùng để biết đã kê đơn cho bệnh án này chưa

    public MedicalRecordResponse() {}

    public MedicalRecordResponse(Integer recordId, Integer appointmentId,
                                  Integer patientId, String patientName,
                                  Integer doctorId, String doctorName,
                                  String diagnosis, String treatmentPlan,
                                  LocalDate recommendedFollowUpDate,
                                  LocalDateTime createdAt, boolean hasPrescription) {
        this.recordId = recordId;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.diagnosis = diagnosis;
        this.treatmentPlan = treatmentPlan;
        this.recommendedFollowUpDate = recommendedFollowUpDate;
        this.createdAt = createdAt;
        this.hasPrescription = hasPrescription;
    }

    public Integer getRecordId() { return recordId; }
    public void setRecordId(Integer v) { this.recordId = v; }

    public Integer getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Integer v) { this.appointmentId = v; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer v) { this.patientId = v; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String v) { this.patientName = v; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer v) { this.doctorId = v; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String v) { this.doctorName = v; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String v) { this.diagnosis = v; }

    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String v) { this.treatmentPlan = v; }

    public LocalDate getRecommendedFollowUpDate() { return recommendedFollowUpDate; }
    public void setRecommendedFollowUpDate(LocalDate v) { this.recommendedFollowUpDate = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public boolean isHasPrescription() { return hasPrescription; }
    public void setHasPrescription(boolean v) { this.hasPrescription = v; }
}
