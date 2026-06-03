package cms.app.Dto;

import java.time.LocalDateTime;

/**
 * DTO tổng hợp chỉ số sức khỏe mới nhất của bệnh nhân.
 */
public class HealthMetricSummaryResponse {

    private Integer patientId;
    private String patientName;

    private Integer systolicBp;
    private Integer diastolicBp;
    private LocalDateTime bpMeasuredAt;

    private Integer heartRate;
    private LocalDateTime heartRateMeasuredAt;

    private Double weight;
    private Double height;
    private Double bmi;
    private String bmiCategory;
    private LocalDateTime weightMeasuredAt;

    private Double temperature;
    private LocalDateTime temperatureMeasuredAt;

    private Double bloodGlucose;
    private LocalDateTime bloodGlucoseMeasuredAt;

    private Integer spO2;
    private LocalDateTime spO2MeasuredAt;

    // ==================== Getters & Setters ====================
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }

    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }

    public LocalDateTime getBpMeasuredAt() { return bpMeasuredAt; }
    public void setBpMeasuredAt(LocalDateTime bpMeasuredAt) { this.bpMeasuredAt = bpMeasuredAt; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public LocalDateTime getHeartRateMeasuredAt() { return heartRateMeasuredAt; }
    public void setHeartRateMeasuredAt(LocalDateTime heartRateMeasuredAt) { this.heartRateMeasuredAt = heartRateMeasuredAt; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getBmi() { return bmi; }
    public void setBmi(Double bmi) { this.bmi = bmi; }

    public String getBmiCategory() { return bmiCategory; }
    public void setBmiCategory(String bmiCategory) { this.bmiCategory = bmiCategory; }

    public LocalDateTime getWeightMeasuredAt() { return weightMeasuredAt; }
    public void setWeightMeasuredAt(LocalDateTime weightMeasuredAt) { this.weightMeasuredAt = weightMeasuredAt; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public LocalDateTime getTemperatureMeasuredAt() { return temperatureMeasuredAt; }
    public void setTemperatureMeasuredAt(LocalDateTime temperatureMeasuredAt) { this.temperatureMeasuredAt = temperatureMeasuredAt; }

    public Double getBloodGlucose() { return bloodGlucose; }
    public void setBloodGlucose(Double bloodGlucose) { this.bloodGlucose = bloodGlucose; }

    public LocalDateTime getBloodGlucoseMeasuredAt() { return bloodGlucoseMeasuredAt; }
    public void setBloodGlucoseMeasuredAt(LocalDateTime bloodGlucoseMeasuredAt) { this.bloodGlucoseMeasuredAt = bloodGlucoseMeasuredAt; }

    public Integer getSpO2() { return spO2; }
    public void setSpO2(Integer spO2) { this.spO2 = spO2; }

    public LocalDateTime getSpO2MeasuredAt() { return spO2MeasuredAt; }
    public void setSpO2MeasuredAt(LocalDateTime spO2MeasuredAt) { this.spO2MeasuredAt = spO2MeasuredAt; }
}
