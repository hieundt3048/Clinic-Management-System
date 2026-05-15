package cms.app.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cms.app.Entity.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    List<Invoice> findByPatient_PatientIdOrderByInvoiceIdDesc(Integer patientId);

    Optional<Invoice> findByAppointment_AppointmentId(Integer appointmentId);
}
