package cms.app.Repository;

import java.time.LocalDate;

import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Repository
public class CreateMedicalRecordRequest {

    @NotNull(message = "Mã lịch hẹn không được để trống")
    private Integer appointmentId;

    @NotBlank(message = "Chẩn đoán không được để trống")
    private String diagnosis;

    private String treatmentPlan;

    private LocalDate recommendedFollowUpDate; // null nếu không cần tái khám

    public Integer getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Integer v) { this.appointmentId = v; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String v) { this.diagnosis = v; }

    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String v) { this.treatmentPlan = v; }

    public LocalDate getRecommendedFollowUpDate() { return recommendedFollowUpDate; }
    public void setRecommendedFollowUpDate(LocalDate v) { this.recommendedFollowUpDate = v; }
}
