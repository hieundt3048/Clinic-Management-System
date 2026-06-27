package cms.app.Dto;

import java.time.LocalDateTime;
import java.util.Map;

public class SystemMonitorResponse {
    private String status;
    private LocalDateTime checkedAt;
    private long totalUsers;
    private long activeUsers;
    private long lockedUsers;
    private Map<String, Long> usersByRole;
    private long totalAppointments;
    private long todayAppointments;
    private Map<String, Long> appointmentsByStatus;
    private long totalInvoices;
    private double paidRevenue;
    private double unpaidAmount;
    private Map<String, Long> invoicesByStatus;
    private long totalServiceRequests;
    private Map<String, Long> serviceRequestsByStatus;
    private long totalMedicationReminders;
    private long activeMedicationReminders;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getLockedUsers() { return lockedUsers; }
    public void setLockedUsers(long lockedUsers) { this.lockedUsers = lockedUsers; }

    public Map<String, Long> getUsersByRole() { return usersByRole; }
    public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public Map<String, Long> getAppointmentsByStatus() { return appointmentsByStatus; }
    public void setAppointmentsByStatus(Map<String, Long> appointmentsByStatus) { this.appointmentsByStatus = appointmentsByStatus; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

    public double getPaidRevenue() { return paidRevenue; }
    public void setPaidRevenue(double paidRevenue) { this.paidRevenue = paidRevenue; }

    public double getUnpaidAmount() { return unpaidAmount; }
    public void setUnpaidAmount(double unpaidAmount) { this.unpaidAmount = unpaidAmount; }

    public Map<String, Long> getInvoicesByStatus() { return invoicesByStatus; }
    public void setInvoicesByStatus(Map<String, Long> invoicesByStatus) { this.invoicesByStatus = invoicesByStatus; }

    public long getTotalServiceRequests() { return totalServiceRequests; }
    public void setTotalServiceRequests(long totalServiceRequests) { this.totalServiceRequests = totalServiceRequests; }

    public Map<String, Long> getServiceRequestsByStatus() { return serviceRequestsByStatus; }
    public void setServiceRequestsByStatus(Map<String, Long> serviceRequestsByStatus) { this.serviceRequestsByStatus = serviceRequestsByStatus; }

    public long getTotalMedicationReminders() { return totalMedicationReminders; }
    public void setTotalMedicationReminders(long totalMedicationReminders) { this.totalMedicationReminders = totalMedicationReminders; }

    public long getActiveMedicationReminders() { return activeMedicationReminders; }
    public void setActiveMedicationReminders(long activeMedicationReminders) { this.activeMedicationReminders = activeMedicationReminders; }
}