package cms.app.Dto;

public class SpecialtyResponse {
    private Integer specialtyId;
    private String specialtyName;
    private String description;

    public SpecialtyResponse(Integer specialtyId, String specialtyName, String description) {
        this.specialtyId = specialtyId;
        this.specialtyName = specialtyName;
        this.description = description;
    }

    public Integer getSpecialtyId() { return specialtyId; }
    public String getSpecialtyName() { return specialtyName; }
    public String getDescription() { return description; }
}
