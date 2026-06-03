package cms.app.Service;

import java.util.List;

import cms.app.Dto.CreateServiceRequestDto;
import cms.app.Dto.ServiceRequestResponse;
import cms.app.Dto.UpdateServiceResultDto;
import cms.app.Entity.ServiceRequest.RequestStatus;

/**
 * Interface cho Service chỉ định cận lâm sàng.
 */
public interface IServiceRequestService {

    /**
     * Bác sĩ chỉ định một hoặc nhiều dịch vụ cận lâm sàng.
     * Mỗi dịch vụ tạo ra một ServiceRequest riêng, status = PENDING.
     */
    List<ServiceRequestResponse> createRequests(CreateServiceRequestDto request);

    /** Lấy chi tiết một chỉ định */
    ServiceRequestResponse getById(Integer requestId);

    /** Lấy tất cả chỉ định theo bệnh án */
    List<ServiceRequestResponse> getByRecord(Integer recordId);

    /** Lấy toàn bộ lịch sử chỉ định của bệnh nhân */
    List<ServiceRequestResponse> getByPatient(Integer patientId);

    /** Lấy danh sách chỉ định theo trạng thái — dùng cho dashboard nhân viên */
    List<ServiceRequestResponse> getByStatus(RequestStatus status);

    /**
     * Cập nhật kết quả sau khi thực hiện.
     * Tự động set performedAt = now() khi status → COMPLETED.
     */
    ServiceRequestResponse updateResult(Integer requestId, UpdateServiceResultDto dto);

    /** Hủy chỉ định (chỉ khi status = PENDING) */
    ServiceRequestResponse cancelRequest(Integer requestId);
}
