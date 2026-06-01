package cms.app.Service;

import java.time.LocalDate;
import java.util.List;

import cms.app.Dto.HealthMetricRequest;
import cms.app.Dto.HealthMetricResponse;
import cms.app.Dto.HealthMetricSummaryResponse;

/**
 * Interface cho Service theo dõi sức khỏe.
 */
public interface IHealthMetricService {

    /** Bệnh nhân ghi chỉ số sức khỏe mới */
    HealthMetricResponse recordMetric(HealthMetricRequest request);

    /** Lấy toàn bộ lịch sử chỉ số của bệnh nhân */
    List<HealthMetricResponse> getHistory(Integer patientId);

    /** Lấy lịch sử theo khoảng thời gian */
    List<HealthMetricResponse> getHistoryByDateRange(Integer patientId, LocalDate from, LocalDate to);

    /** Lấy tổng hợp chỉ số mới nhất của bệnh nhân */
    HealthMetricSummaryResponse getLatestSummary(Integer patientId);

    /** Xóa một bản ghi chỉ số */
    void deleteMetric(Integer metricId);
}
