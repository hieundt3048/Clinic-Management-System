package cms.app.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.HealthMetricRequest;
import cms.app.Dto.HealthMetricResponse;
import cms.app.Dto.HealthMetricSummaryResponse;
import cms.app.Entity.HealthMetric;
import cms.app.Entity.Patient;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.HealthMetricRepository;
import cms.app.Repository.PatientRepository;

@Service
public class HealthMetricService implements IHealthMetricService {

    private final HealthMetricRepository metricRepo;
    private final PatientRepository patientRepo;

    public HealthMetricService(HealthMetricRepository metricRepo,
                                PatientRepository patientRepo) {
        this.metricRepo = metricRepo;
        this.patientRepo = patientRepo;
    }

    // Ghi chỉ số mới
    @Override
    @Transactional
    public HealthMetricResponse recordMetric(HealthMetricRequest request) {
        // Kiểm tra phải có ít nhất 1 chỉ số
        if (isAllNull(request)) {
            throw new IllegalArgumentException("Vui lòng nhập ít nhất 1 chỉ số sức khỏe");
        }

        Patient patient = patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh nhân ID: " + request.getPatientId()));

        HealthMetric metric = new HealthMetric();
        metric.setPatient(patient);
        metric.setMeasuredAt(request.getMeasuredAt() != null
                ? request.getMeasuredAt() : LocalDateTime.now());
        metric.setSystolicBp(request.getSystolicBp());
        metric.setDiastolicBp(request.getDiastolicBp());
        metric.setHeartRate(request.getHeartRate());
        metric.setWeight(request.getWeight());
        metric.setHeight(request.getHeight());
        metric.setTemperature(request.getTemperature());
        metric.setBloodGlucose(request.getBloodGlucose());
        metric.setSpO2(request.getSpO2());
        metric.setNotes(request.getNotes());

        metricRepo.save(metric);
        return toResponse(metric);
    }

    // Lịch sử chỉ số
    @Override
    @Transactional(readOnly = true)
    public List<HealthMetricResponse> getHistory(Integer patientId) {
        return metricRepo.findByPatientId(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthMetricResponse> getHistoryByDateRange(Integer patientId,
                                                             LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        return metricRepo.findByPatientIdAndDateRange(
                        patientId,
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Tổng hợp chỉ số mới nhất
    @Override
    @Transactional(readOnly = true)
    public HealthMetricSummaryResponse getLatestSummary(Integer patientId) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh nhân ID: " + patientId));

        HealthMetricSummaryResponse summary = new HealthMetricSummaryResponse();
        summary.setPatientId(patientId);
        summary.setPatientName(patient.getFullName());

        // Huyết áp
        metricRepo.findLatestWithBp(patientId).ifPresent(h -> {
            summary.setSystolicBp(h.getSystolicBp());
            summary.setDiastolicBp(h.getDiastolicBp());
            summary.setBpMeasuredAt(h.getMeasuredAt());
        });

        // Nhịp tim
        metricRepo.findLatestWithHeartRate(patientId).ifPresent(h -> {
            summary.setHeartRate(h.getHeartRate());
            summary.setHeartRateMeasuredAt(h.getMeasuredAt());
        });

        // Cân nặng + BMI
        metricRepo.findLatestWithWeight(patientId).ifPresent(h -> {
            summary.setWeight(h.getWeight());
            summary.setHeight(h.getHeight());
            summary.setWeightMeasuredAt(h.getMeasuredAt());
            if (h.getWeight() != null && h.getHeight() != null && h.getHeight() > 0) {
                double bmi = calculateBmi(h.getWeight(), h.getHeight());
                summary.setBmi(bmi);
                summary.setBmiCategory(getBmiCategory(bmi));
            }
        });

        // Nhiệt độ
        metricRepo.findLatestWithTemperature(patientId).ifPresent(h -> {
            summary.setTemperature(h.getTemperature());
            summary.setTemperatureMeasuredAt(h.getMeasuredAt());
        });

        // Đường huyết
        metricRepo.findLatestWithBloodGlucose(patientId).ifPresent(h -> {
            summary.setBloodGlucose(h.getBloodGlucose());
            summary.setBloodGlucoseMeasuredAt(h.getMeasuredAt());
        });

        // SpO2
        metricRepo.findLatestWithSpO2(patientId).ifPresent(h -> {
            summary.setSpO2(h.getSpO2());
            summary.setSpO2MeasuredAt(h.getMeasuredAt());
        });

        return summary;
    }

    // Xóa bản ghi
    @Override
    @Transactional
    public void deleteMetric(Integer metricId) {
        HealthMetric metric = metricRepo.findById(metricId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chỉ số ID: " + metricId));
        metricRepo.delete(metric);
    }

    // Private helpers
    private HealthMetricResponse toResponse(HealthMetric h) {
        HealthMetricResponse r = new HealthMetricResponse();
        r.setMetricId(h.getMetricId());
        r.setPatientId(h.getPatient().getPatientId());
        r.setPatientName(h.getPatient().getFullName());
        r.setMeasuredAt(h.getMeasuredAt());
        r.setSystolicBp(h.getSystolicBp());
        r.setDiastolicBp(h.getDiastolicBp());
        r.setHeartRate(h.getHeartRate());
        r.setWeight(h.getWeight());
        r.setHeight(h.getHeight());
        r.setTemperature(h.getTemperature());
        r.setBloodGlucose(h.getBloodGlucose());
        r.setSpO2(h.getSpO2());
        r.setNotes(h.getNotes());

        // Tính BMI nếu đủ dữ liệu
        if (h.getWeight() != null && h.getHeight() != null && h.getHeight() > 0) {
            double bmi = calculateBmi(h.getWeight(), h.getHeight());
            r.setBmi(bmi);
            r.setBmiCategory(getBmiCategory(bmi));
        }

        return r;
    }

    /** BMI = cân nặng (kg) / (chiều cao (m))^2, làm tròn 1 chữ số thập phân */
    private double calculateBmi(double weightKg, double heightCm) {
        double heightM = heightCm / 100.0;
        double bmi = weightKg / (heightM * heightM);
        return BigDecimal.valueOf(bmi)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    /** Phân loại BMI theo tiêu chuẩn WHO cho người châu Á */
    private String getBmiCategory(double bmi) {
        if (bmi < 18.5) return "Thiếu cân";
        if (bmi < 23.0) return "Bình thường";
        if (bmi < 27.5) return "Thừa cân";
        return "Béo phì";
    }

    /** Kiểm tra tất cả chỉ số đều null — yêu cầu nhập ít nhất 1 */
    private boolean isAllNull(HealthMetricRequest r) {
        return r.getSystolicBp()   == null
            && r.getDiastolicBp()  == null
            && r.getHeartRate()    == null
            && r.getWeight()       == null
            && r.getHeight()       == null
            && r.getTemperature()  == null
            && r.getBloodGlucose() == null
            && r.getSpO2()         == null;
    }
}
