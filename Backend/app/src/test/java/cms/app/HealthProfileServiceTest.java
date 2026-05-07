package cms.app;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import cms.app.Dto.HealthProfileResponse;
import cms.app.Dto.UpdateHealthProfileRequest;
import cms.app.Entity.Patient;
import cms.app.Entity.User;
import cms.app.Exception.ResourceNotFoundException;
import cms.app.Repository.PatientRepository;
import cms.app.Service.HealthProfileService;

@ExtendWith(MockitoExtension.class)
class HealthProfileServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private HealthProfileService healthProfileService;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUserId(10);
        user.setEmail("patient@clinic.com");
        user.setPhone("0900000000");

        samplePatient = new Patient();
        samplePatient.setPatientId(5);
        samplePatient.setUser(user);
        samplePatient.setFullName("Nguyen Van A");
        samplePatient.setDateOfBirth(LocalDate.of(2000, 1, 1));
        samplePatient.setGender("Nam");
        samplePatient.setAddress("Ha Noi");
    }

    @Test
    void getMyProfile_validEmail_returnsProfile() {
        when(patientRepository.findByUser_Email("patient@clinic.com")).thenReturn(Optional.of(samplePatient));

        HealthProfileResponse result = healthProfileService.getMyProfile("patient@clinic.com");

        assertThat(result.getPatientId()).isEqualTo(5);
        assertThat(result.getUserId()).isEqualTo(10);
        assertThat(result.getFullName()).isEqualTo("Nguyen Van A");
        assertThat(result.getEmail()).isEqualTo("patient@clinic.com");
        verify(patientRepository, times(1)).findByUser_Email("patient@clinic.com");
    }

    @Test
    void getMyProfile_emailNotFound_throwsResourceNotFoundException() {
        when(patientRepository.findByUser_Email("missing@clinic.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> healthProfileService.getMyProfile("missing@clinic.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing@clinic.com");
    }

    @Test
    void updateMyProfile_validRequest_updatesPatientAndUserPhone() {
        UpdateHealthProfileRequest request = new UpdateHealthProfileRequest();
        request.setFullName("Tran Thi B");
        request.setDateOfBirth(LocalDate.of(1998, 5, 20));
        request.setGender("Nu");
        request.setAddress("Da Nang");
        request.setPhone("0911222333");

        when(patientRepository.findByUser_Email("patient@clinic.com")).thenReturn(Optional.of(samplePatient));
        when(patientRepository.save(samplePatient)).thenReturn(samplePatient);

        HealthProfileResponse result = healthProfileService.updateMyProfile("patient@clinic.com", request);

        assertThat(samplePatient.getFullName()).isEqualTo("Tran Thi B");
        assertThat(samplePatient.getDateOfBirth()).isEqualTo(LocalDate.of(1998, 5, 20));
        assertThat(samplePatient.getGender()).isEqualTo("Nu");
        assertThat(samplePatient.getAddress()).isEqualTo("Da Nang");
        assertThat(samplePatient.getUser().getPhone()).isEqualTo("0911222333");
        assertThat(result.getPhone()).isEqualTo("0911222333");
        verify(patientRepository, times(1)).save(samplePatient);
    }

    @Test
    void updateMyProfile_emailNotFound_throwsResourceNotFoundException() {
        UpdateHealthProfileRequest request = new UpdateHealthProfileRequest();
        request.setFullName("Tran Thi B");

        when(patientRepository.findByUser_Email("missing@clinic.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> healthProfileService.updateMyProfile("missing@clinic.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing@clinic.com");
    }
}
