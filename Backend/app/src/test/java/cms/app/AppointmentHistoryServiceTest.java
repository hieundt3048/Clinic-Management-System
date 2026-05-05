package cms.app;


import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import cms.app.Dto.AppointmentFilterRequest;
import cms.app.Dto.AppointmentHistoryResponse;
import cms.app.Entity.Appointment;
import cms.app.Entity.Appointment.AppointmentStatus;
import cms.app.Entity.Doctor;
import cms.app.Entity.Patient;
import cms.app.Entity.Specialty;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.AppointmentHistoryRepository;
import cms.app.Service.AppointmentHistoryService;

@ExtendWith(MockitoExtension.class)
class AppointmentHistoryServiceTest {

    @Mock
    private AppointmentHistoryRepository appointmentRepo;

    @InjectMocks
    private AppointmentHistoryService service;

    private Appointment sampleAppointment;

    public AppointmentHistoryServiceTest() {
    }

    @BeforeEach
    void setUp() {
        // Tạo dữ liệu mẫu
        Specialty specialty = new Specialty();
        specialty.setSpecialtyId(1);
        specialty.setSpecialtyName("Nội tổng quát");

        Doctor doctor = new Doctor();
        doctor.setDoctorId(10);
        doctor.setFullName("Bs. Nguyễn Văn A");
        doctor.setRoomNumber("P101");
        doctor.setSpecialty(specialty);

        Patient patient = new Patient();
        patient.setPatientId(5);
        patient.setFullName("Trần Thị B");

        sampleAppointment = new Appointment();
        sampleAppointment.setAppointmentId(100);
        sampleAppointment.setAppointmentDate(LocalDateTime.of(2024, 6, 15, 9, 0));
        sampleAppointment.setStatus(AppointmentStatus.COMPLETED);
        sampleAppointment.setReason("Đau đầu, chóng mặt");
        sampleAppointment.setFollowUp(false);
        sampleAppointment.setPatient(patient);
        sampleAppointment.setDoctor(doctor);
    }

    // ─────────────────────────────────────────
    // Tests: getHistoryByPatient
    // ─────────────────────────────────────────

    @Test
    void getHistoryByPatient_noFilter_returnsAllAppointments() {
        when(appointmentRepo.findByPatientId(5)).thenReturn(List.of(sampleAppointment));

        List<AppointmentHistoryResponse> result = service.getHistoryByPatient(5, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAppointmentId()).isEqualTo(100);
        assertThat(result.get(0).getPatientName()).isEqualTo("Trần Thị B");
        assertThat(result.get(0).getDoctorName()).isEqualTo("Bs. Nguyễn Văn A");
        assertThat(result.get(0).getSpecialtyName()).isEqualTo("Nội tổng quát");

        verify(appointmentRepo).findByPatientId(5);
        verify(appointmentRepo, never()).findByPatientIdWithFilter(any(), any(), any(), any());
    }

    @Test
    void getHistoryByPatient_withStatusFilter_callsFilterQuery() {
        AppointmentFilterRequest filter = new AppointmentFilterRequest();
        filter.setStatus(AppointmentStatus.COMPLETED);

        when(appointmentRepo.findByPatientIdWithFilter(eq(5), eq(AppointmentStatus.COMPLETED), any(), any()))
                .thenReturn(List.of(sampleAppointment));

        List<AppointmentHistoryResponse> result = service.getHistoryByPatient(5, filter);

        assertThat(result).hasSize(1);
        verify(appointmentRepo).findByPatientIdWithFilter(eq(5), eq(AppointmentStatus.COMPLETED), any(), any());
    }

    @Test
    void getHistoryByPatient_noResult_throwsResourceNotFoundException() {
        when(appointmentRepo.findByPatientId(999)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.getHistoryByPatient(999, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // ─────────────────────────────────────────
    // Tests: getHistoryByDoctor
    // ─────────────────────────────────────────

    @Test
    void getHistoryByDoctor_noFilter_returnsAllAppointments() {
        when(appointmentRepo.findByDoctorId(10)).thenReturn(List.of(sampleAppointment));

        List<AppointmentHistoryResponse> result = service.getHistoryByDoctor(10, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDoctorId()).isEqualTo(10);
        verify(appointmentRepo).findByDoctorId(10);
    }

    @Test
    void getHistoryByDoctor_noResult_throwsResourceNotFoundException() {
        when(appointmentRepo.findByDoctorId(999)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.getHistoryByDoctor(999, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // ─────────────────────────────────────────
    // Tests: getAllHistory (Admin)
    // ─────────────────────────────────────────

    @Test
    void getAllHistory_noFilter_returnsAll() {
        when(appointmentRepo.findAllWithFilter(isNull(), isNull(), isNull()))
                .thenReturn(List.of(sampleAppointment));

        List<AppointmentHistoryResponse> result = service.getAllHistory(null);

        assertThat(result).hasSize(1);
    }

    @Test
    void getAllHistory_emptyResult_returnsEmptyList() {
        when(appointmentRepo.findAllWithFilter(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        List<AppointmentHistoryResponse> result = service.getAllHistory(null);

        assertThat(result).isEmpty();
    }
}
