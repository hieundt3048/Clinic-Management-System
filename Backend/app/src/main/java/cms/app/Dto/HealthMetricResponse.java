package cms.app.Dto;

import java.time.LocalDateTime;

/** DTO trả về chỉ số sức khỏe, có tính thêm BMI nếu đủ dữ liệu */
public class HealthMetricResponse {

    private Integer metricId;
    private Integer patientId;
    private String patientName;
    private LocalDateTime measuredAt;

    // Các chỉ số
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer heartRate;
    private Double weight;
    private Double height;
    private Double temperature;
    private Double bloodGlucose;
    private Integer spO2;
    private String notes;

    /** BMI tính tự động nếu có cả weight và height */
    private Double bmi;

    /** Đánh giá BMI: Thiếu cân / Bình thường / Thừa cân / Béo phì */
    private String bmiCategory;

    // ==================== Constructors ====================
    public HealthMetricResponse() {}

    // ==================== Getters & Setters ====================
    public Integer getMetricId() { return metricId; }
    public void setMetricId(Integer metricId) { this.metricId = metricId; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

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

    public Double getBmi() { return bmi; }
    public void setBmi(Double bmi) { this.bmi = bmi; }

    public String getBmiCategory() { return bmiCategory; }
    public void setBmiCategory(String bmiCategory) { this.bmiCategory = bmiCategory; }
}
