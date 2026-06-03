package cms.app.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.CreateServiceRequestDto;
import cms.app.Dto.CreateServiceRequestDto.ServiceItemDto;
import cms.app.Dto.ServiceRequestResponse;
import cms.app.Dto.UpdateServiceResultDto;
import cms.app.Entity.Doctor;
import cms.app.Entity.MedicalRecord;
import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceRequest;
import cms.app.Entity.ServiceRequest.RequestStatus;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.ServiceCatalogRepository;
import cms.app.Repository.ServiceRequestRepository;

@Service
public class ServiceRequestService implements IServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepo;
    private final ServiceCatalogRepository serviceCatalogRepo;
    private final MedicalRecordRepository medicalRecordRepo;
    private final DoctorRepository doctorRepo;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepo,
                                  ServiceCatalogRepository serviceCatalogRepo,
                                  MedicalRecordRepository medicalRecordRepo,
                                  DoctorRepository doctorRepo) {
        this.serviceRequestRepo = serviceRequestRepo;
        this.serviceCatalogRepo = serviceCatalogRepo;
        this.medicalRecordRepo  = medicalRecordRepo;
        this.doctorRepo         = doctorRepo;
    }

    // Tạo chỉ định
    @Override
    @Transactional
    public List<ServiceRequestResponse> createRequests(CreateServiceRequestDto request) {
        MedicalRecord record = medicalRecordRepo.findByIdWithDetails(request.getRecordId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án ID: " + request.getRecordId()));

        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bác sĩ ID: " + request.getDoctorId()));

        // Mỗi dịch vụ → 1 ServiceRequest riêng
        List<ServiceRequest> saved = request.getServices().stream()
                .map(item -> createSingleRequest(record, doctor, item))
                .map(serviceRequestRepo::save)
                .collect(Collectors.toList());

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Truy vấn
    @Override
    @Transactional(readOnly = true)
    public ServiceRequestResponse getById(Integer requestId) {
        return toResponse(findById(requestId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getByRecord(Integer recordId) {
        if (!medicalRecordRepo.existsById(recordId)) {
            throw new ResourceNotFoundException("Không tìm thấy bệnh án ID: " + recordId);
        }
        return serviceRequestRepo.findByRecordId(recordId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getByPatient(Integer patientId) {
        return serviceRequestRepo.findByPatientId(patientId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getByStatus(RequestStatus status) {
        return serviceRequestRepo.findByStatus(status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Cập nhật kết quả
    @Override
    @Transactional
    public ServiceRequestResponse updateResult(Integer requestId, UpdateServiceResultDto dto) {
        ServiceRequest sr = findById(requestId);

        // Không cho cập nhật nếu đã CANCELLED
        if (sr.getStatus() == RequestStatus.CANCELLED) {
            throw new IllegalStateException("Không thể cập nhật chỉ định đã hủy");
        }

        sr.setStatus(dto.getStatus());
        sr.setResultSummary(dto.getResultSummary());
        sr.setResultImages(dto.getResultImages());

        // Tự động ghi nhận thời điểm hoàn thành
        if (dto.getStatus() == RequestStatus.COMPLETED) {
            sr.setPerformedAt(LocalDateTime.now());
        }

        serviceRequestRepo.save(sr);
        return toResponse(sr);
    }

    // Hủy chỉ định
    @Override
    @Transactional
    public ServiceRequestResponse cancelRequest(Integer requestId) {
        ServiceRequest sr = findById(requestId);

        if (sr.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Chỉ có thể hủy chỉ định đang ở trạng thái PENDING. " +
                    "Trạng thái hiện tại: " + sr.getStatus());
        }

        sr.setStatus(RequestStatus.CANCELLED);
        serviceRequestRepo.save(sr);
        return toResponse(sr);
    }

    // Private helpers
    private ServiceRequest createSingleRequest(MedicalRecord record,
                                                Doctor doctor,
                                                ServiceItemDto item) {
        ServiceCatalog catalog = serviceCatalogRepo.findById(item.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy dịch vụ ID: " + item.getServiceId()));

        ServiceRequest sr = new ServiceRequest();
        sr.setMedicalRecord(record);
        sr.setDoctor(doctor);
        sr.setServiceCatalog(catalog);
        sr.setIndicationReason(item.getIndicationReason());
        sr.setStatus(RequestStatus.PENDING);
        sr.setCreatedAt(LocalDateTime.now());
        return sr;
    }

    private ServiceRequest findById(Integer id) {
        return serviceRequestRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chỉ định cận lâm sàng ID: " + id));
    }

    private ServiceRequestResponse toResponse(ServiceRequest sr) {
        ServiceRequestResponse r = new ServiceRequestResponse();
        r.setRequestId(sr.getRequestId());
        r.setRecordId(sr.getMedicalRecord().getRecordId());
        r.setPatientId(sr.getMedicalRecord().getPatient().getPatientId());
        r.setPatientName(sr.getMedicalRecord().getPatient().getFullName());
        r.setDoctorId(sr.getDoctor().getDoctorId());
        r.setDoctorName(sr.getDoctor().getFullName());
        r.setServiceId(sr.getServiceCatalog().getServiceId());
        r.setServiceName(sr.getServiceCatalog().getServiceName());
        r.setBasePrice(sr.getServiceCatalog().getBasePrice());
        r.setIndicationReason(sr.getIndicationReason());
        r.setStatus(sr.getStatus());
        r.setCreatedAt(sr.getCreatedAt());
        r.setResultSummary(sr.getResultSummary());
        r.setResultImages(sr.getResultImages());
        r.setPerformedAt(sr.getPerformedAt());
        return r;
    }
}
