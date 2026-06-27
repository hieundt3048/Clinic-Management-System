package cms.app.Dto;

public class DoctorResponse {
    private Integer doctorId;
    private String fullName;
    private String roomNumber;
    private Integer specialtyId;
    private String specialtyName;

    public DoctorResponse(Integer doctorId, String fullName, String roomNumber,
                          Integer specialtyId, String specialtyName) {
        this.doctorId = doctorId;
        this.fullName = fullName;
        this.roomNumber = roomNumber;
        this.specialtyId = specialtyId;
        this.specialtyName = specialtyName;
    }

    public Integer getDoctorId() { return doctorId; }
    public String getFullName() { return fullName; }
    public String getRoomNumber() { return roomNumber; }
    public Integer getSpecialtyId() { return specialtyId; }
    public String getSpecialtyName() { return specialtyName; }
}
