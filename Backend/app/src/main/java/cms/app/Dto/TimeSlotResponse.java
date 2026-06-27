package cms.app.Dto;

public class TimeSlotResponse {
    private String time;
    private boolean available;

    public TimeSlotResponse(String time, boolean available) {
        this.time = time;
        this.available = available;
    }

    public String getTime() { return time; }
    public boolean isAvailable() { return available; }
}
