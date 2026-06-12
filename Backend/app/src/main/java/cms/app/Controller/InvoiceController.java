package cms.app.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Dto.ApiResponse;
import cms.app.Dto.CreateInvoiceRequest;
import cms.app.Dto.InvoiceResponse;
import cms.app.Dto.PayInvoiceRequest;
import cms.app.Service.IInvoiceService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final IInvoiceService invoiceService;

    public InvoiceController(IInvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    /**
     * Lập hóa đơn cho lịch hẹn đã hoàn thành.
     * POST /api/invoices
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceResponse data = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo hóa đơn thành công", data));
    }

    /**
     * Danh sách hóa đơn của bệnh nhân đang đăng nhập.
     * GET /api/invoices/me
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> listMyInvoices(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<InvoiceResponse> data = invoiceService.listMyInvoices(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Chi tiết một hóa đơn (bệnh nhân: chỉ của mình; admin: mọi hóa đơn).
     * GET /api/invoices/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("id") Integer invoiceId) {
        InvoiceResponse data = invoiceService.getInvoice(
                userDetails.getUsername(), userDetails.getAuthorities(), invoiceId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Thanh toán hóa đơn (bệnh nhân, chỉ hóa đơn của chính mình, trạng thái UNPAID).
     * POST /api/invoices/{id}/pay
     */
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> payInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("id") Integer invoiceId,
            @Valid @RequestBody PayInvoiceRequest request) {
        InvoiceResponse data = invoiceService.payInvoice(userDetails.getUsername(), invoiceId, request);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công", data));
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> data = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hóa đơn thành công", data));
    }
}
