package cms.app.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateDoctorRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100)
    private String fullName;

    @NotNull(message = "Chuyên khoa không được để trống")
    private Integer specialtyId;

    @Size(max = 50)
    private String roomNumber;

    @Size(max = 20)
    private String phone;

    public String getFullName()        { return fullName; }
    public void setFullName(String v)  { this.fullName = v; }

    public Integer getSpecialtyId()         { return specialtyId; }
    public void setSpecialtyId(Integer v)   { this.specialtyId = v; }

    public String getRoomNumber()           { return roomNumber; }
    public void setRoomNumber(String v)     { this.roomNumber = v; }

    public String getPhone()               { return phone; }
    public void setPhone(String v)         { this.phone = v; }
}
