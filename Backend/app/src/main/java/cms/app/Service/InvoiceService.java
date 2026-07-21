package cms.app.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.CreateInvoiceRequest;
import cms.app.Dto.InvoiceResponse;
import cms.app.Dto.PayInvoiceRequest;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Invoice;
import cms.app.Entity.Invoice.InvoiceType;
import cms.app.Entity.Invoice.PaymentStatus;
import cms.app.Entity.Patient;
import cms.app.Entity.ServiceCatalog;
import cms.app.Entity.ServiceCatalog.ServiceType;
import cms.app.Exception.InvalidRequestException;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.InvoiceRepository;
import cms.app.Repository.PatientRepository;

@Service
public class InvoiceService implements IInvoiceService {

    private static final String ROLE_ADMIN = "ROLE_ADMIN";

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch hẹn: " + request.getAppointmentId()));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new InvalidRequestException(
                    "Chỉ được lập hóa đơn phí khám cho lịch hẹn đã xác nhận. Trạng thái hiện tại: "
                            + appointment.getStatus());
        }

        invoiceRepository.findFirstByAppointment_AppointmentIdAndInvoiceType(
                appointment.getAppointmentId(), InvoiceType.CLINICAL_EXAM)
                .ifPresent(existing -> {
                    throw new InvalidRequestException("Lịch hẹn này đã có hóa đơn phí khám.");
                });

        ServiceCatalog service = appointment.getService();
        if (service == null) {
            throw new InvalidRequestException("Lịch hẹn chưa có dịch vụ phí khám. Vui lòng kiểm tra lại dữ liệu đặt lịch.");
        }
        if (service.getServiceType() != ServiceType.CONSULTATION) {
            throw new InvalidRequestException("Dịch vụ gắn với lịch hẹn không phải phí khám lâm sàng.");
        }

        Invoice invoice = new Invoice();
        invoice.setPatient(appointment.getPatient());
        invoice.setAppointment(appointment);
        invoice.setInvoiceType(InvoiceType.CLINICAL_EXAM);
        invoice.setDescription("Phí khám lâm sàng - " + service.getServiceName());
        invoice.setTotalAmount(service.getBasePrice());
        invoice.setStatus(PaymentStatus.UNPAID);
        invoice.setPaymentMethod(null);
        invoice.setPaidAt(null);

        Invoice saved = invoiceRepository.save(invoice);
        notificationService.notifyPatient(
                saved.getPatient(),
                "INVOICE_CREATED",
                "Có hóa đơn phí khám mới",
                "Phòng khám đã tạo hóa đơn phí khám " + formatAmount(saved.getTotalAmount())
                        + ". Vui lòng kiểm tra và thanh toán khi sẵn sàng.",
                "/billing");
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> listMyInvoices(String patientUserEmail) {
        Patient patient = patientRepository.findByUser_Email(patientUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ bệnh nhân cho tài khoản: " + patientUserEmail));

        return invoiceRepository.findByPatient_PatientIdOrderByInvoiceIdDesc(patient.getPatientId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(String userEmail, Iterable<? extends GrantedAuthority> authorities, Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + invoiceId));

        if (isAdmin(authorities)) {
            return toResponse(invoice);
        }

        Patient patient = patientRepository.findByUser_Email(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ bệnh nhân cho tài khoản: " + userEmail));

        if (!invoice.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new InvalidRequestException("Bạn không có quyền xem hóa đơn này.");
        }
        return toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAllByOrderByInvoiceIdDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceResponse payInvoice(String patientUserEmail, Integer invoiceId, PayInvoiceRequest request) {
        Patient patient = patientRepository.findByUser_Email(patientUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ bệnh nhân cho tài khoản: " + patientUserEmail));

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + invoiceId));

        if (!invoice.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new InvalidRequestException("Bạn không thể thanh toán hóa đơn của người khác.");
        }

        if (invoice.getStatus() == PaymentStatus.PAID) {
            throw new InvalidRequestException("Hóa đơn đã được thanh toán.");
        }

        String method = request.getPaymentMethod().trim();

        if ("CASH".equals(method)) {
            invoice.setStatus(PaymentStatus.PENDING_CASH);
            invoice.setPaymentMethod(method);
            invoice.setPaidAt(null);
        } else {
            invoice.setStatus(PaymentStatus.PAID);
            invoice.setPaymentMethod(method);
            invoice.setPaidAt(LocalDateTime.now());
        }

        Invoice saved = invoiceRepository.save(invoice);
        if (saved.getStatus() == PaymentStatus.PAID) {
            notifyInvoicePaid(saved);
        } else if (saved.getStatus() == PaymentStatus.PENDING_CASH) {
            notificationService.notifyPatient(
                    saved.getPatient(),
                    "INVOICE_PENDING_CASH",
                    "Đã ghi nhận thanh toán tại quầy",
                    "Hóa đơn của bạn đang chờ nhân viên xác nhận thu tiền mặt tại quầy.",
                    "/billing");
            notificationService.notifyAdmins(
                    "INVOICE_PENDING_CASH",
                    "Có thanh toán tiền mặt cần duyệt",
                    saved.getPatient().getFullName() + " đã chọn thanh toán tại quầy cho hóa đơn "
                            + formatAmount(saved.getTotalAmount()) + ".",
                    "/admin/invoices");
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public InvoiceResponse confirmCashPayment(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + invoiceId));

        if (invoice.getStatus() == PaymentStatus.PAID) {
            throw new InvalidRequestException("Hóa đơn đã được thanh toán.");
        }

        if (invoice.getStatus() != PaymentStatus.PENDING_CASH
                && invoice.getStatus() != PaymentStatus.UNPAID) {
            throw new InvalidRequestException(
                    "Chỉ xác nhận thu tiền cho hóa đơn chưa thanh toán hoặc đang chờ tại quầy. Trạng thái hiện tại: "
                    + invoice.getStatus());
        }

        invoice.setStatus(PaymentStatus.PAID);
        invoice.setPaymentMethod("CASH");
        invoice.setPaidAt(LocalDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);
        notifyInvoicePaid(saved);
        return toResponse(saved);
    }

    private void notifyInvoicePaid(Invoice invoice) {
        notificationService.notifyPatient(
                invoice.getPatient(),
                "INVOICE_PAID",
                "Hóa đơn đã thanh toán",
                "Phòng khám đã xác nhận hóa đơn " + formatAmount(invoice.getTotalAmount()) + " của bạn.",
                "/billing");
        notificationService.notifyAdmins(
                "INVOICE_PAID",
                "Hóa đơn đã được thanh toán",
                invoice.getPatient().getFullName() + " đã thanh toán hóa đơn "
                        + formatAmount(invoice.getTotalAmount()) + ".",
                "/admin/invoices");

        if (invoice.getInvoiceType() == InvoiceType.CLINICAL_SERVICE) {
            notificationService.notifyDoctor(
                    invoice.getAppointment().getDoctor(),
                    "CLINICAL_INVOICE_PAID",
                    "Bệnh nhân đã thanh toán CLS",
                    invoice.getPatient().getFullName()
                            + " đã thanh toán dịch vụ cận lâm sàng. Bạn có thể thực hiện hoặc cập nhật kết quả.",
                    "/doctor/service-requests");
        }
    }

    private String formatAmount(Double amount) {
        if (amount == null) return "0 đ";
        return String.format("%,.0f đ", amount);
    }

    private boolean isAdmin(Iterable<? extends GrantedAuthority> authorities) {
        for (GrantedAuthority a : authorities) {
            if (ROLE_ADMIN.equals(a.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        Appointment a = invoice.getAppointment();
        InvoiceResponse r = new InvoiceResponse();
        r.setInvoiceId(invoice.getInvoiceId());
        r.setPatientId(invoice.getPatient().getPatientId());
        r.setAppointmentId(a.getAppointmentId());
        r.setInvoiceType(invoice.getInvoiceType());
        r.setDescription(invoice.getDescription());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setDoctorName(a.getDoctor().getFullName());
        r.setSpecialtyName(a.getSpecialty().getSpecialtyName());
        r.setTotalAmount(invoice.getTotalAmount());
        r.setStatus(invoice.getStatus());
        r.setPaymentMethod(invoice.getPaymentMethod());
        r.setPaidAt(invoice.getPaidAt());
        return r;
    }
}