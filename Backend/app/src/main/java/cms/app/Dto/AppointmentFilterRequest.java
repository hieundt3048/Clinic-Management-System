package cms.app.Dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import cms.app.Entity.Appointment.AppointmentStatus;

//DTO nhận tham số lọc lịch sử đặt khám từ request.
public class AppointmentFilterRequest {

    //Lọc theo trạng thái: PENDING, CONFIRMED, COMPLETED, CANCELED 
    private AppointmentStatus status;

    //Lọc từ ngày (tính theo appointmentDate)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    //Lọc đến ngày (tính theo appointmentDate)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    // ==================== Getters & Setters ====================

    public AppointmentStatus getStatus(){ return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
}
