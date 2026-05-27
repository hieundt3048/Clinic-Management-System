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

    public PrescriptionService(PrescriptionRepository prescriptionRepo,
                                MedicalRecordRepository medicalRecordRepo) {
        this.prescriptionRepo = prescriptionRepo;
        this.medicalRecordRepo = medicalRecordRepo;
    }

    // Tạo đơn thuốc
    @Override
    @Transactional
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {
        MedicalRecord record = medicalRecordRepo.findByIdWithDetails(request.getRecordId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án ID: " + request.getRecordId()));

        // Tạo Prescription
        Prescription prescription = new Prescription();
        prescription.setMedicalRecord(record);
        prescription.setNotes(request.getNotes());

        // Map từng PrescriptionDetailRequest → PrescriptionDetail
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

        return toResponse(prescription);
    }

    // Lấy đơn thuốc theo ID
    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Integer prescriptionId) {
        Prescription prescription = prescriptionRepo.findByIdWithDetails(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn thuốc ID: " + prescriptionId));
        return toResponse(prescription);
    }

    // Lấy đơn thuốc theo bệnh án
    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByRecord(Integer recordId) {
        // Kiểm tra bệnh án tồn tại
        if (!medicalRecordRepo.existsById(recordId)) {
            throw new ResourceNotFoundException("Không tìm thấy bệnh án ID: " + recordId);
        }
        return prescriptionRepo.findByRecordId(recordId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Lấy đơn thuốc theo bệnh nhân
    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatient(Integer patientId) {
        return prescriptionRepo.findByPatientId(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Xóa đơn thuốc
    @Override
    @Transactional
    public void deletePrescription(Integer prescriptionId) {
        Prescription prescription = prescriptionRepo.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn thuốc ID: " + prescriptionId));
        prescriptionRepo.delete(prescription);
    }

    // Private helper — map Entity → DTO
    private PrescriptionResponse toResponse(Prescription p) {
        PrescriptionResponse response = new PrescriptionResponse();
        response.setPrescriptionId(p.getPrescriptionId());
        response.setCreatedAt(p.getCreatedAt());
        response.setNotes(p.getNotes());

        // Thông tin từ MedicalRecord
        MedicalRecord record = p.getMedicalRecord();
        response.setRecordId(record.getRecordId());

        // Thông tin bệnh nhân — Patient.fullName, Patient.user.email
        response.setPatientId(record.getPatient().getPatientId());
        response.setPatientName(record.getPatient().getFullName());

        // Thông tin bác sĩ — Doctor.fullName
        response.setDoctorId(record.getDoctor().getDoctorId());
        response.setDoctorName(record.getDoctor().getFullName());

        // Map details
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
