package cms.app.Service;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;

import cms.app.Dto.CreateInvoiceRequest;
import cms.app.Dto.InvoiceResponse;
import cms.app.Dto.PayInvoiceRequest;

public interface IInvoiceService {

    InvoiceResponse createInvoice(CreateInvoiceRequest request);

    List<InvoiceResponse> listMyInvoices(String patientUserEmail);

    InvoiceResponse getInvoice(String userEmail, Iterable<? extends GrantedAuthority> authorities, Integer invoiceId);

    InvoiceResponse payInvoice(String patientUserEmail, Integer invoiceId, PayInvoiceRequest request);

    List<InvoiceResponse> getAllInvoices();
}
