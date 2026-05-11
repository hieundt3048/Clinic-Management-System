package cms.app;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import cms.app.Dto.FollowUpReminderResponse;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.MedicalRecord;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentHistoryRepository;
import cms.app.Repository.MedicalRecordRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Service.FollowUpReminderService;

@ExtendWith(MockitoExtension.class)
class FollowUpReminderServiceTest {

    @Mock
    private PatientRepository patientRepository;
    @Mock
    private MedicalRecordRepository medicalRecordRepository;
    @Mock
    private AppointmentHistoryRepository appointmentHistoryRepository;

    @InjectMocks
    private FollowUpReminderService followUpReminderService;

    @Test
    void getMyFollowUpReminders_returnsBothKindsSortedByTime() {
        LocalDate fixedToday = LocalDate.of(2026, 5, 10);

        User user = new User();
        user.setEmail("p@clinic.com");

        Patient patient = new Patient();
        patient.setPatientId(1);
        patient.setFullName("Benh nhan A");
        patient.setUser(user);

        Doctor doctor = new Doctor();
        doctor.setDoctorId(2);
        doctor.setFullName("Bs. B");

        Specialty specialty = new Specialty();
        specialty.setSpecialtyId(3);
        specialty.setSpecialtyName("Noi");
        doctor.setSpecialty(specialty);

        MedicalRecord record = new MedicalRecord();
        record.setRecordId(10);
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setRecommendedFollowUpDate(fixedToday.plusDays(3));

        Appointment appt = new Appointment();
        appt.setAppointmentId(20);
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setSpecialty(specialty);
        appt.setAppointmentDate(fixedToday.plusDays(2).atTime(9, 0));
        appt.setStatus(AppointmentStatus.CONFIRMED);
        appt.setFollowUp(true);

        when(patientRepository.findByUser_Email("p@clinic.com")).thenReturn(Optional.of(patient));
        when(medicalRecordRepository.findRecommendedFollowUpsForPatient(
                eq(1), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(record));
        when(appointmentHistoryRepository.findUpcomingFollowUpAppointmentsForPatient(
                eq(1), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(appt));

        List<FollowUpReminderResponse> result =
                followUpReminderService.getMyFollowUpReminders("p@clinic.com", 7);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getKind()).isEqualTo(FollowUpReminderResponse.ReminderKind.SCHEDULED_FOLLOW_UP_APPOINTMENT);
        assertThat(result.get(0).getReferenceId()).isEqualTo(20);
        assertThat(result.get(1).getKind()).isEqualTo(FollowUpReminderResponse.ReminderKind.RECOMMENDED_FOLLOW_UP_DATE);
        assertThat(result.get(1).getReferenceId()).isEqualTo(10);
    }

    @Test
    void getMyFollowUpReminders_unknownEmail_throws() {
        when(patientRepository.findByUser_Email("x@clinic.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> followUpReminderService.getMyFollowUpReminders("x@clinic.com", 7))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
