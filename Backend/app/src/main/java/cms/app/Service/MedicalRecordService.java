package cms.app.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Entity.Appointment;
import cms.app.Entity.MedicalRecord;
import cms.app.Exception.BusinessLogicException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.CreateMedicalRecordRequest;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.MedicalRecordResponse;
import cms.app.Repository.PrescriptionRepository;
import cms.app.Repository.UpdateMedicalRecordRequest;

@Service
public class MedicalRecordService implements IMedicalRecordService {

    private final MedicalRecordRepository recordRepo;
    private final AppointmentRepository appointmentRepo;
    private final PrescriptionRepository prescriptionRepo;

    public MedicalRecordService(MedicalRecordRepository recordRepo,
                                 AppointmentRepository appointmentRepo,
                                 PrescriptionRepository prescriptionRepo) {
        this.recordRepo       = recordRepo;
        this.appointmentRepo  = appointmentRepo;
        this.prescriptionRepo = prescriptionRepo;
    }

    @Override
    @Transactional
    public MedicalRecordResponse createRecord(CreateMedicalRecordRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch hẹn ID: " + request.getAppointmentId()));

        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new BusinessLogicException(
                    "Chỉ tạo bệnh án cho lịch hẹn đã hoàn thành. Trạng thái hiện tại: "
                            + appointment.getStatus());
        }

        if (recordRepo.existsByAppointment_AppointmentId(request.getAppointmentId())) {
            throw new BusinessLogicException(
                    "Lịch hẹn này đã có bệnh án. Vui lòng chọn lịch hẹn khác.");
        }

        MedicalRecord record = new MedicalRecord();
        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        record.setDoctor(appointment.getDoctor());
        record.setDiagnosis(request.getDiagnosis().trim());
        record.setTreatmentPlan(
                request.getTreatmentPlan() != null ? request.getTreatmentPlan().trim() : null);
        record.setRecommendedFollowUpDate(request.getRecommendedFollowUpDate());

        MedicalRecord saved = recordRepo.save(record);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MedicalRecordResponse updateRecord(Integer recordId, Integer doctorId, UpdateMedicalRecordRequest request) {
        MedicalRecord record = recordRepo.findByIdWithDetails(recordId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án ID: " + recordId));

        if (doctorId == null || !record.getDoctor().getDoctorId().equals(doctorId)) {
            throw new BusinessLogicException("Bạn không có quyền cập nhật bệnh án này.");
        }

        record.setDiagnosis(request.getDiagnosis().trim());
        record.setTreatmentPlan(
                request.getTreatmentPlan() != null && !request.getTreatmentPlan().trim().isEmpty()
                        ? request.getTreatmentPlan().trim()
                        : null);
        record.setRecommendedFollowUpDate(request.getRecommendedFollowUpDate());

        MedicalRecord saved = recordRepo.save(record);
        return toResponse(saved);
    }
    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getByDoctor(Integer doctorId) {
        return recordRepo.findByDoctorId(doctorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getByPatient(Integer patientId) {
        return recordRepo.findByPatientId(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MedicalRecordResponse toResponse(MedicalRecord r) {
        boolean hasRx = prescriptionRepo.existsByMedicalRecord_RecordId(r.getRecordId());
        return new MedicalRecordResponse(
                r.getRecordId(),
                r.getAppointment().getAppointmentId(),
                r.getPatient().getPatientId(),
                r.getPatient().getFullName(),
                r.getDoctor().getDoctorId(),
                r.getDoctor().getFullName(),
                r.getDiagnosis(),
                r.getTreatmentPlan(),
                r.getRecommendedFollowUpDate(),
                r.getCreatedAt(),
                hasRx
        );
    }
}
