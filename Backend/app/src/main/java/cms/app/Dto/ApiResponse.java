package cms.app.Dto;

public class ApiResponse<T> {
    private int status;       // Mã HTTP Status (200, 201, 400, 404...)
    private String message;   // Thông báo cho Frontend (VD: "Thành công", "Lỗi dữ liệu")
    private T data;           // Dữ liệu thực tế (VD: AppointmentResponseDTO)

    public ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

}
