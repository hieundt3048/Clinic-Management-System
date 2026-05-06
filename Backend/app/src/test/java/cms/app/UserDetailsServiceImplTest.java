package cms.app;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import cms.app.Entity.User;
import cms.app.Entity.User.Role;
import cms.app.Repository.UserRepository;
import cms.app.Service.UserDetailsServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private UserDetailsServiceImpl service;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setUserId(1);
        sampleUser.setEmail("patient@clinic.com");
        sampleUser.setPasswordHash("$2a$10$hashedpassword");
        sampleUser.setRole(Role.PATIENT);
        sampleUser.setStatus(true);
    }

    // ─────────────────────────────────────────
    // loadUserByUsername — thành công
    // ─────────────────────────────────────────

    @Test
    void loadUserByUsername_validEmail_returnsUserDetails() {
        when(userRepo.findByEmail("patient@clinic.com")).thenReturn(Optional.of(sampleUser));

        UserDetails result = service.loadUserByUsername("patient@clinic.com");

        assertThat(result.getUsername()).isEqualTo("patient@clinic.com");
        assertThat(result.getPassword()).isEqualTo("$2a$10$hashedpassword");
        assertThat(result.getAuthorities()).hasSize(1);
        assertThat(result.getAuthorities().iterator().next().getAuthority())
                .isEqualTo("ROLE_PATIENT");
    }

    @Test
    void loadUserByUsername_doctorRole_hasCorrectAuthority() {
        sampleUser.setEmail("doctor@clinic.com");
        sampleUser.setRole(Role.DOCTOR);
        when(userRepo.findByEmail("doctor@clinic.com")).thenReturn(Optional.of(sampleUser));

        UserDetails result = service.loadUserByUsername("doctor@clinic.com");

        assertThat(result.getAuthorities().iterator().next().getAuthority())
                .isEqualTo("ROLE_DOCTOR");
    }

    @Test
    void loadUserByUsername_adminRole_hasCorrectAuthority() {
        sampleUser.setEmail("admin@clinic.com");
        sampleUser.setRole(Role.ADMIN);
        when(userRepo.findByEmail("admin@clinic.com")).thenReturn(Optional.of(sampleUser));

        UserDetails result = service.loadUserByUsername("admin@clinic.com");

        assertThat(result.getAuthorities().iterator().next().getAuthority())
                .isEqualTo("ROLE_ADMIN");
    }

    // ─────────────────────────────────────────
    // loadUserByUsername — thất bại
    // ─────────────────────────────────────────

    @Test
    void loadUserByUsername_emailNotFound_throwsUsernameNotFoundException() {
        when(userRepo.findByEmail("unknown@clinic.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("unknown@clinic.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("unknown@clinic.com");
    }

    @Test
    void loadUserByUsername_callsRepositoryExactlyOnce() {
        when(userRepo.findByEmail(any())).thenReturn(Optional.of(sampleUser));

        service.loadUserByUsername("patient@clinic.com");

        verify(userRepo, times(1)).findByEmail("patient@clinic.com");
    }
}
