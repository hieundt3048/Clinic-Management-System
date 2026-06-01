package cms.app.Dto;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO nhận yêu cầu ghi chỉ số sức khỏe.
 */
public class HealthMetricRequest {

    @NotNull(message = "patientId không được để trống")
    private Integer patientId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime measuredAt;   // null → dùng thời điểm hiện tại

    // Huyết áp
    @Min(value = 60,  message = "Huyết áp tâm thu không hợp lệ (60–250 mmHg)")
    @Max(value = 250, message = "Huyết áp tâm thu không hợp lệ (60–250 mmHg)")
    private Integer systolicBp;

    @Min(value = 40,  message = "Huyết áp tâm trương không hợp lệ (40–150 mmHg)")
    @Max(value = 150, message = "Huyết áp tâm trương không hợp lệ (40–150 mmHg)")
    private Integer diastolicBp;

    // Nhịp tim
    @Min(value = 30,  message = "Nhịp tim không hợp lệ (30–250 bpm)")
    @Max(value = 250, message = "Nhịp tim không hợp lệ (30–250 bpm)")
    private Integer heartRate;

    // Cân nặng
    @Min(value = 1,   message = "Cân nặng không hợp lệ (1–500 kg)")
    @Max(value = 500, message = "Cân nặng không hợp lệ (1–500 kg)")
    private Double weight;

    // Chiều cao
    @Min(value = 30,  message = "Chiều cao không hợp lệ (30–300 cm)")
    @Max(value = 300, message = "Chiều cao không hợp lệ (30–300 cm)")
    private Double height;

    // Nhiệt độ
    @Min(value = 34,  message = "Nhiệt độ không hợp lệ (34–43 °C)")
    @Max(value = 43,  message = "Nhiệt độ không hợp lệ (34–43 °C)")
    private Double temperature;

    // Đường huyết
    @Min(value = 1,   message = "Đường huyết không hợp lệ (1–50 mmol/L)")
    @Max(value = 50,  message = "Đường huyết không hợp lệ (1–50 mmol/L)")
    private Double bloodGlucose;

    // SpO2
    @Min(value = 50,  message = "SpO2 không hợp lệ (50–100%)")
    @Max(value = 100, message = "SpO2 không hợp lệ (50–100%)")
    private Integer spO2;

    private String notes;

    // ==================== Getters & Setters ====================
    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

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
