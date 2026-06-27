package cms.app.Dto;

public class DoctorDetailResponse {
    private Integer doctorId;
    private String fullName;
    private String roomNumber;
    private Integer specialtyId;
    private String specialtyName;
    private String email;
    private String phone;
    private boolean active;  // user.status

    public DoctorDetailResponse() {}

    public DoctorDetailResponse(Integer doctorId, String fullName, String roomNumber,
                                 Integer specialtyId, String specialtyName,
                                 String email, String phone, boolean active) {
        this.doctorId      = doctorId;
        this.fullName      = fullName;
        this.roomNumber    = roomNumber;
        this.specialtyId   = specialtyId;
        this.specialtyName = specialtyName;
        this.email         = email;
        this.phone         = phone;
        this.active        = active;
    }

    public Integer getDoctorId()      { return doctorId; }
    public String getFullName()       { return fullName; }
    public String getRoomNumber()     { return roomNumber; }
    public Integer getSpecialtyId()   { return specialtyId; }
    public String getSpecialtyName()  { return specialtyName; }
    public String getEmail()          { return email; }
    public String getPhone()          { return phone; }
    public boolean isActive()         { return active; }

    public void setDoctorId(Integer doctorId)          { this.doctorId = doctorId; }
    public void setFullName(String fullName)            { this.fullName = fullName; }
    public void setRoomNumber(String roomNumber)        { this.roomNumber = roomNumber; }
    public void setSpecialtyId(Integer specialtyId)    { this.specialtyId = specialtyId; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }
    public void setEmail(String email)                  { this.email = email; }
    public void setPhone(String phone)                  { this.phone = phone; }
    public void setActive(boolean active)               { this.active = active; }
}
