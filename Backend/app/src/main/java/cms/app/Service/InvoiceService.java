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
import cms.app.Entity.Invoice.PaymentStatus;
import cms.app.Entity.Patient;
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

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository) {
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch hẹn: " + request.getAppointmentId()));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidRequestException(
                    "Chỉ được lập hóa đơn cho lịch hẹn đã xác nhận hoặc hoàn thành. Trạng thái hiện tại: "
                            + appointment.getStatus());
        }

        if (invoiceRepository.findByAppointment_AppointmentId(appointment.getAppointmentId()).isPresent()) {
            throw new InvalidRequestException("Lịch hẹn này đã có hóa đơn.");
        }

        Invoice invoice = new Invoice();
        invoice.setPatient(appointment.getPatient());
        invoice.setAppointment(appointment);
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setStatus(PaymentStatus.UNPAID);
        invoice.setPaymentMethod(null);
        invoice.setPaidAt(null);

        Invoice saved = invoiceRepository.save(invoice);
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
        return invoiceRepository.findAll().stream()
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
            // Tiền mặt → chờ đến quầy, chưa PAID ngay
            invoice.setStatus(PaymentStatus.PENDING_CASH);
            invoice.setPaymentMethod(method);
            invoice.setPaidAt(null); // chưa thanh toán thật
        } else {
            // Chuyển khoản / Thẻ → PAID luôn
            invoice.setStatus(PaymentStatus.PAID);
            invoice.setPaymentMethod(method);
            invoice.setPaidAt(LocalDateTime.now());
        }

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
    }

    // ─── Thêm hàm mới: Admin duyệt thanh toán tiền mặt ──────────────────────────    
    @Override
    @Transactional
    public InvoiceResponse confirmCashPayment(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + invoiceId));

        if (invoice.getStatus() != PaymentStatus.PENDING_CASH) {
            throw new InvalidRequestException(
                    "Chỉ duyệt được hóa đơn đang chờ thanh toán tiền mặt. Trạng thái hiện tại: "
                    + invoice.getStatus());
        }

        invoice.setStatus(PaymentStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);
        return toResponse(saved);
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
