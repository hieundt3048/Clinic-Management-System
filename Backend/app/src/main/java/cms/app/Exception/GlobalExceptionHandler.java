import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;

@RestControllerAdvice // Đánh dấu đây là class lắng nghe lỗi toàn cục cho các API trả về JSON
public class GlobalExceptionHandler {

    // 1. Xử lý lỗi Không tìm thấy dữ liệu (Thường do .orElseThrow ném ra)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value()) // HTTP 404
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
                
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // 2. Xử lý lỗi Vi phạm nghiệp vụ (Ví dụ: Đặt trùng lịch, Hủy lịch đã khám)
    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<ErrorResponse> handleBusinessLogicException(
            BusinessLogicException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value()) // HTTP 400
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
                
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 3. Xử lý tất cả các lỗi RuntimeException khác chưa lường trước được
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value()) // HTTP 500
                .error("Internal Server Error")
                .message(ex.getMessage()) // Hoặc bạn có thể giấu lỗi thực sự và ghi: "Lỗi hệ thống, vui lòng thử lại sau" để bảo mật
                .path(request.getRequestURI())
                .build();
                
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}