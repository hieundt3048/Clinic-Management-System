package cms.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Invoice;
import cms.app.Entity.Invoice.InvoiceType;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    List<Invoice> findByPatient_PatientIdOrderByInvoiceIdDesc(Integer patientId);

    List<Invoice> findByAppointment_AppointmentIdOrderByInvoiceIdDesc(Integer appointmentId);

    Optional<Invoice> findFirstByAppointment_AppointmentIdAndInvoiceType(Integer appointmentId, InvoiceType invoiceType);

    List<Invoice> findAllByOrderByInvoiceIdDesc();
}
