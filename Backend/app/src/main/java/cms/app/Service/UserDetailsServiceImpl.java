package cms.app.Service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import cms.app.Config.CustomUserDetails;
import cms.app.Entity.User;
import cms.app.Repository.DoctorRepository;
import cms.app.Repository.PatientRepository;
import cms.app.Repository.UserRepository;

/**
 * Triển khai UserDetailsService để Spring Security load user từ DB.
 * Role được thêm prefix "ROLE_" theo chuẩn Spring Security.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
 
    private final UserRepository userRepo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
 
    public UserDetailsServiceImpl(UserRepository userRepo,
                                   PatientRepository patientRepo,
                                   DoctorRepository doctorRepo) {
        this.userRepo    = userRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo  = doctorRepo;
    }
 
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User account = userRepo.findByEmailOrPhone(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));
 
        Integer patientId = null;
        Integer doctorId  = null;
 
        if (account.getRole() == User.Role.PATIENT) {
            patientId = patientRepo.findByUser_Email(account.getEmail())
                    .map(p -> p.getPatientId())
                    .orElse(null);
        } else if (account.getRole() == User.Role.DOCTOR) {
            doctorId = doctorRepo.findByUser_UserId(account.getUserId())
                    .map(d -> d.getDoctorId())
                    .orElse(null);
        }
 
        return new CustomUserDetails(
                account.getUserId(),
                account.getEmail(),
                account.getPasswordHash(),
                account.getRole(),
                patientId,
                doctorId,
                account.isStatus()
        );
    }
}
