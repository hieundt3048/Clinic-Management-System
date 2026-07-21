package cms.app.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.CreatePrescriptionRequest;
import cms.app.Dto.PrescriptionResponse;
import cms.app.Dto.PrescriptionResponse.PrescriptionDetailResponse;
import cms.app.Entity.MedicalRecord;
import cms.app.Entity.Prescription;
import cms.app.Entity.PrescriptionDetail;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.PrescriptionRepository;

@Service
public class PrescriptionService implements IPrescriptionService {

    private final PrescriptionRepository prescriptionRepo;
    private final MedicalRecordRepository medicalRecordRepo;
    private final NotificationService notificationService;

    public PrescriptionService(PrescriptionRepository prescriptionRepo,
                               MedicalRecordRepository medicalRecordRepo,
                               NotificationService notificationService) {
        this.prescriptionRepo = prescriptionRepo;
        this.medicalRecordRepo = medicalRecordRepo;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {
        MedicalRecord record = medicalRecordRepo.findByIdWithDetails(request.getRecordId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án ID: " + request.getRecordId()));

        Prescription prescription = new Prescription();
        prescription.setMedicalRecord(record);
        prescription.setNotes(request.getNotes());

        List<PrescriptionDetail> details = request.getDetails().stream()
                .map(dto -> {
                    PrescriptionDetail detail = new PrescriptionDetail();
                    detail.setPrescription(prescription);
                    detail.setMedicineName(dto.getMedicineName());
                    detail.setDosage(dto.getDosage());
                    detail.setFrequency(dto.getFrequency());
                    detail.setDurationDays(dto.getDurationDays());
                    return detail;
                })
                .collect(Collectors.toList());

        prescription.setDetails(details);
        prescriptionRepo.save(prescription);
        notificationService.notifyPatient(
                record.getPatient(),
                "PRESCRIPTION_CREATED",
                "Đơn thuốc mới đã được kê",
                "Bác sĩ " + record.getDoctor().getFullName()
                        + " đã kê đơn thuốc mới. Bạn có thể xem chi tiết và tạo lịch nhắc uống thuốc nếu cần.",
                "/prescriptions");

        return toResponse(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Integer prescriptionId) {
        Prescription prescription = prescriptionRepo.findByIdWithDetails(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn thuốc ID: " + prescriptionId));
        return toResponse(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByRecord(Integer recordId) {
        if (!medicalRecordRepo.existsById(recordId)) {
            throw new ResourceNotFoundException("Không tìm thấy bệnh án ID: " + recordId);
        }
        return prescriptionRepo.findByRecordId(recordId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatient(Integer patientId) {
        return prescriptionRepo.findByPatientId(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePrescription(Integer prescriptionId) {
        Prescription prescription = prescriptionRepo.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn thuốc ID: " + prescriptionId));
        prescriptionRepo.delete(prescription);
    }

    private PrescriptionResponse toResponse(Prescription p) {
        PrescriptionResponse response = new PrescriptionResponse();
        response.setPrescriptionId(p.getPrescriptionId());
        response.setCreatedAt(p.getCreatedAt());
        response.setNotes(p.getNotes());

        MedicalRecord record = p.getMedicalRecord();
        response.setRecordId(record.getRecordId());
        response.setPatientId(record.getPatient().getPatientId());
        response.setPatientName(record.getPatient().getFullName());
        response.setDoctorId(record.getDoctor().getDoctorId());
        response.setDoctorName(record.getDoctor().getFullName());

        List<PrescriptionDetailResponse> detailResponses = p.getDetails()
                .stream()
                .map(d -> {
                    PrescriptionDetailResponse dr = new PrescriptionDetailResponse();
                    dr.setDetailId(d.getDetailId());
                    dr.setMedicineName(d.getMedicineName());
                    dr.setDosage(d.getDosage());
                    dr.setFrequency(d.getFrequency());
                    dr.setDurationDays(d.getDurationDays());
                    return dr;
                })
                .collect(Collectors.toList());

        response.setDetails(detailResponses);
        return response;
    }
}