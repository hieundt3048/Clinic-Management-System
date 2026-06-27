package cms.app.Repository;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public class UpdateMedicalRecordRequest {

    @NotBlank(message = "Chẩn đoán không được để trống")
    private String diagnosis;

    private String treatmentPlan;

    private LocalDate recommendedFollowUpDate;

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }

    public LocalDate getRecommendedFollowUpDate() { return recommendedFollowUpDate; }
    public void setRecommendedFollowUpDate(LocalDate recommendedFollowUpDate) { this.recommendedFollowUpDate = recommendedFollowUpDate; }
}