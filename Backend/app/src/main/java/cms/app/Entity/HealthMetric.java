package cms.app.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity lưu chỉ số sức khỏe của bệnh nhân.
 */
@Entity
@Table(name = "health_metrics")
public class HealthMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer metricId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private LocalDateTime measuredAt = LocalDateTime.now();

    private Integer systolicBp;

    private Integer diastolicBp;

    private Integer heartRate;

    private Double weight;

    private Double height;

    private Double temperature;

    private Double bloodGlucose;

    private Integer spO2;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String notes;

    // ==================== Constructors ====================
    public HealthMetric() {}

    // ==================== Getters & Setters ====================
    public Integer getMetricId() { return metricId; }
    public void setMetricId(Integer metricId) { this.metricId = metricId; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }

    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }

    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(Double bloodGlucose) { this.bloodGlucose = bloodGlucose; }

    public Integer getSpO2() { return spO2; }
    public void setSpO2(Integer spO2) { this.spO2 = spO2; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
