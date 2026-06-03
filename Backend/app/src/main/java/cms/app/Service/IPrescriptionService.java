package cms.app.Service;

import cms.app.Dto.CreatePrescriptionRequest;
import cms.app.Dto.PrescriptionResponse;

import java.util.List;

/**
 * Interface cho Service kê đơn thuốc (UC11).
 * DOCTOR kê đơn, PATIENT/DOCTOR/ADMIN xem đơn.
 */
public interface IPrescriptionService {

    /**
     * Bác sĩ tạo đơn thuốc mới cho một bệnh án.
     * @param request thông tin đơn thuốc và danh sách thuốc
     * @return đơn thuốc vừa tạo
     */
    PrescriptionResponse createPrescription(CreatePrescriptionRequest request);

    /**
     * Lấy đơn thuốc theo ID.
     * @param prescriptionId ID đơn thuốc
     */
    PrescriptionResponse getPrescriptionById(Integer prescriptionId);

    /**
     * Lấy tất cả đơn thuốc của một bệnh án.
     * @param recordId ID bệnh án
     */
    List<PrescriptionResponse> getPrescriptionsByRecord(Integer recordId);

    /**
     * Lấy tất cả đơn thuốc của một bệnh nhân (toàn bộ lịch sử).
     * @param patientId ID bệnh nhân
     */
    List<PrescriptionResponse> getPrescriptionsByPatient(Integer patientId);

    /**
     * Xóa đơn thuốc (chỉ cho phép nếu chưa có nhắc nhở liên kết).
     * @param prescriptionId ID đơn thuốc
     */
    void deletePrescription(Integer prescriptionId);
}
