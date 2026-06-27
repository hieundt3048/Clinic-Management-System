package cms.app.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cms.app.Dto.SystemMonitorResponse;
import cms.app.Entity.Appointment;
import cms.app.Entity.Invoice;
import cms.app.Entity.MedicationReminder;
import cms.app.Entity.ServiceRequest;
import cms.app.Entity.User;
import cms.app.Repository.AppointmentRepository;
import cms.app.Repository.InvoiceRepository;
import cms.app.Repository.MedicationReminderRepository;
import cms.app.Repository.ServiceRequestRepository;
import cms.app.Repository.UserRepository;

@Service
public class SystemMonitorService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final MedicationReminderRepository medicationReminderRepository;

    public SystemMonitorService(UserRepository userRepository,
                                AppointmentRepository appointmentRepository,
                                InvoiceRepository invoiceRepository,
                                ServiceRequestRepository serviceRequestRepository,
                                MedicationReminderRepository medicationReminderRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.medicationReminderRepository = medicationReminderRepository;
    }

    @Transactional(readOnly = true)
    public SystemMonitorResponse getSnapshot() {
        List<User> users = userRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();
        List<Invoice> invoices = invoiceRepository.findAll();
        List<ServiceRequest> serviceRequests = serviceRequestRepository.findAll();
        List<MedicationReminder> reminders = medicationReminderRepository.findAll();

        SystemMonitorResponse response = new SystemMonitorResponse();
        response.setStatus("UP");
        response.setCheckedAt(LocalDateTime.now());

        response.setTotalUsers(users.size());
        response.setActiveUsers(users.stream().filter(User::isStatus).count());
        response.setLockedUsers(users.stream().filter(user -> !user.isStatus()).count());
        response.setUsersByRole(countEnumValues(users, user -> user.getRole().name(), User.Role.values()));

        LocalDate today = LocalDate.now();
        response.setTotalAppointments(appointments.size());
        response.setTodayAppointments(appointments.stream()
                .filter(item -> item.getAppointmentDate() != null && item.getAppointmentDate().toLocalDate().equals(today))
                .count());
        response.setAppointmentsByStatus(countEnumValues(appointments, item -> item.getStatus().name(), Appointment.AppointmentStatus.values()));

        response.setTotalInvoices(invoices.size());
        response.setPaidRevenue(invoices.stream()
                .filter(item -> item.getStatus() == Invoice.PaymentStatus.PAID)
                .mapToDouble(item -> item.getTotalAmount() != null ? item.getTotalAmount() : 0)
                .sum());
        response.setUnpaidAmount(invoices.stream()
                .filter(item -> item.getStatus() != Invoice.PaymentStatus.PAID)
                .mapToDouble(item -> item.getTotalAmount() != null ? item.getTotalAmount() : 0)
                .sum());
        response.setInvoicesByStatus(countEnumValues(invoices, item -> item.getStatus().name(), Invoice.PaymentStatus.values()));

        response.setTotalServiceRequests(serviceRequests.size());
        response.setServiceRequestsByStatus(countEnumValues(serviceRequests, item -> item.getStatus().name(), ServiceRequest.RequestStatus.values()));

        response.setTotalMedicationReminders(reminders.size());
        response.setActiveMedicationReminders(reminders.stream().filter(MedicationReminder::isActive).count());

        return response;
    }

    private <T, E extends Enum<E>> Map<String, Long> countEnumValues(List<T> items, Function<T, String> classifier, E[] enumValues) {
        Map<String, Long> counts = items.stream()
                .filter(item -> classifier.apply(item) != null)
                .collect(Collectors.groupingBy(classifier, LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> result = new LinkedHashMap<>();
        Arrays.stream(enumValues).forEach(value -> result.put(value.name(), counts.getOrDefault(value.name(), 0L)));
        return result;
    }
}