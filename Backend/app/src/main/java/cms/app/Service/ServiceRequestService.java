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
import cms.app.Entity.Invoice;
import cms.app.Entity.Invoice.InvoiceType;
import cms.app.Entity.Invoice.PaymentStatus;
import cms.app.Entity.MedicalRecord;
import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceCatalog.ServiceType;
import cms.app.Entity.ServiceRequest;
import cms.app.Entity.ServiceRequest.RequestStatus;
import cms.app.Exception.InvalidRequestException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.InvoiceRepository;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.ServiceCatalogRepository;
import cms.app.Repository.ServiceRequestRepository;

@Service
public class ServiceRequestService implements IServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepo;
    private final ServiceCatalogRepository serviceCatalogRepo;
    private final MedicalRecordRepository medicalRecordRepo;
    private final DoctorRepository doctorRepo;
    private final InvoiceRepository invoiceRepository;
    private final NotificationService notificationService;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepo,
                                  ServiceCatalogRepository serviceCatalogRepo,
                                  MedicalRecordRepository medicalRecordRepo,
                                  DoctorRepository doctorRepo,
                                  InvoiceRepository invoiceRepository,
                                  NotificationService notificationService) {
        this.serviceRequestRepo = serviceRequestRepo;
        this.serviceCatalogRepo = serviceCatalogRepo;
        this.medicalRecordRepo = medicalRecordRepo;
        this.doctorRepo = doctorRepo;
        this.invoiceRepository = invoiceRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public List<ServiceRequestResponse> createRequests(CreateServiceRequestDto request) {
        MedicalRecord record = medicalRecordRepo.findByIdWithDetails(request.getRecordId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án ID: " + request.getRecordId()));

        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bác sĩ ID: " + request.getDoctorId()));

        List<ServiceRequest> requests = request.getServices().stream()
                .map(item -> createSingleRequest(record, doctor, item))
                .collect(Collectors.toList());

        Invoice invoice = createClinicalServiceInvoice(record, requests);
        requests.forEach(sr -> sr.setClinicalInvoice(invoice));

        List<ServiceRequest> saved = serviceRequestRepo.saveAll(requests);
        notificationService.notifyPatient(
                record.getPatient(),
                "CLINICAL_REQUEST_CREATED",
                "Có chỉ định cận lâm sàng mới",
                "Bác sĩ đã chỉ định " + serviceSummary(saved)
                        + ". Hệ thống đã tạo hóa đơn dịch vụ, vui lòng thanh toán trước khi thực hiện.",
                "/billing");
        notificationService.notifyAdmins(
                "CLINICAL_REQUEST_CREATED",
                "Có hóa đơn cận lâm sàng mới",
                doctor.getFullName() + " đã chỉ định " + serviceSummary(saved)
                        + " cho " + record.getPatient().getFullName() + ". Hóa đơn CLS đang chờ thanh toán.",
                "/admin/invoices");
        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

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

    @Override
    @Transactional
    public ServiceRequestResponse updateResult(Integer requestId, UpdateServiceResultDto dto) {
        ServiceRequest sr = findById(requestId);

        if (sr.getStatus() == RequestStatus.CANCELLED) {
            throw new IllegalStateException("Không thể cập nhật chỉ định đã hủy");
        }

        ensureClinicalInvoicePaid(sr);

        sr.setStatus(dto.getStatus());
        sr.setResultSummary(dto.getResultSummary());
        sr.setResultImages(dto.getResultImages());

        if (dto.getStatus() == RequestStatus.COMPLETED) {
            sr.setPerformedAt(LocalDateTime.now());
        }

        ServiceRequest saved = serviceRequestRepo.save(sr);
        if (saved.getStatus() == RequestStatus.COMPLETED) {
            notificationService.notifyPatient(
                    saved.getMedicalRecord().getPatient(),
                    "CLINICAL_RESULT_READY",
                    "Đã có kết quả cận lâm sàng",
                    "Kết quả " + saved.getServiceCatalog().getServiceName()
                            + " đã được cập nhật. Bạn có thể xem trong mục kết quả xét nghiệm.",
                    "/test-results");
            notificationService.notifyAdmins(
                    "CLINICAL_RESULT_READY",
                    "Kết quả cận lâm sàng đã được cập nhật",
                    saved.getDoctor().getFullName() + " đã cập nhật kết quả "
                            + saved.getServiceCatalog().getServiceName() + " cho "
                            + saved.getMedicalRecord().getPatient().getFullName() + ".",
                    "/admin/appointments");
        }
        return toResponse(saved);
    }

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
        ServiceRequest saved = serviceRequestRepo.save(sr);
        notificationService.notifyPatient(
                saved.getMedicalRecord().getPatient(),
                "CLINICAL_REQUEST_CANCELLED",
                "Chỉ định cận lâm sàng đã bị hủy",
                "Chỉ định " + saved.getServiceCatalog().getServiceName() + " đã bị hủy.",
                "/test-results");
        notificationService.notifyAdmins(
                "CLINICAL_REQUEST_CANCELLED",
                "Chỉ định cận lâm sàng đã bị hủy",
                saved.getDoctor().getFullName() + " đã hủy chỉ định "
                        + saved.getServiceCatalog().getServiceName() + " của "
                        + saved.getMedicalRecord().getPatient().getFullName() + ".",
                "/admin/appointments");
        return toResponse(saved);
    }

    private ServiceRequest createSingleRequest(MedicalRecord record,
                                                Doctor doctor,
                                                ServiceItemDto item) {
        ServiceCatalog catalog = serviceCatalogRepo.findById(item.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy dịch vụ ID: " + item.getServiceId()));

        if (catalog.getServiceType() != ServiceType.CLINICAL) {
            throw new InvalidRequestException("Chỉ được chỉ định dịch vụ cận lâm sàng trong phiếu CLS.");
        }

        ServiceRequest sr = new ServiceRequest();
        sr.setMedicalRecord(record);
        sr.setDoctor(doctor);
        sr.setServiceCatalog(catalog);
        sr.setIndicationReason(item.getIndicationReason());
        sr.setStatus(RequestStatus.PENDING);
        sr.setCreatedAt(LocalDateTime.now());
        return sr;
    }

    private Invoice createClinicalServiceInvoice(MedicalRecord record, List<ServiceRequest> requests) {
        double total = requests.stream()
                .map(ServiceRequest::getServiceCatalog)
                .mapToDouble(ServiceCatalog::getBasePrice)
                .sum();

        String serviceSummary = requests.stream()
                .map(sr -> sr.getServiceCatalog().getServiceName())
                .distinct()
                .collect(Collectors.joining(" + "));

        Invoice invoice = new Invoice();
        invoice.setPatient(record.getPatient());
        invoice.setAppointment(record.getAppointment());
        invoice.setInvoiceType(InvoiceType.CLINICAL_SERVICE);
        invoice.setDescription("Dịch vụ cận lâm sàng: " + serviceSummary);
        invoice.setTotalAmount(total);
        invoice.setStatus(PaymentStatus.UNPAID);
        invoice.setPaymentMethod(null);
        invoice.setPaidAt(null);
        return invoiceRepository.save(invoice);
    }

    private void ensureClinicalInvoicePaid(ServiceRequest sr) {
        Invoice invoice = sr.getClinicalInvoice();
        if (invoice != null && invoice.getStatus() != PaymentStatus.PAID) {
            throw new InvalidRequestException(
                    "Chỉ được cập nhật/thực hiện cận lâm sàng sau khi bệnh nhân thanh toán hóa đơn CLS #"
                            + invoice.getInvoiceId());
        }
    }

    private String serviceSummary(List<ServiceRequest> requests) {
        return requests.stream()
                .map(sr -> sr.getServiceCatalog().getServiceName())
                .distinct()
                .collect(Collectors.joining(" + "));
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
        if (sr.getClinicalInvoice() != null) {
            r.setInvoiceId(sr.getClinicalInvoice().getInvoiceId());
            r.setInvoiceStatus(sr.getClinicalInvoice().getStatus());
        }
        r.setIndicationReason(sr.getIndicationReason());
        r.setStatus(sr.getStatus());
        r.setCreatedAt(sr.getCreatedAt());
        r.setResultSummary(sr.getResultSummary());
        r.setResultImages(sr.getResultImages());
        r.setPerformedAt(sr.getPerformedAt());
        return r;
    }
}