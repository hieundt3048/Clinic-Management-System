package cms.app.Config;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import cms.app.Entity.User;

/**
 * Custom UserDetails contains patientId / doctorId / userId for Spring Security expressions.
 */
public class CustomUserDetails implements UserDetails {

    private final Integer userId;
    private final String email;
    private final String passwordHash;
    private final User.Role role;
    private final Integer patientId;
    private final Integer doctorId;
    private final boolean active;

    public CustomUserDetails(Integer userId, String email, String passwordHash,
                              User.Role role, Integer patientId, Integer doctorId) {
        this(userId, email, passwordHash, role, patientId, doctorId, true);
    }

    public CustomUserDetails(Integer userId, String email, String passwordHash,
                              User.Role role, Integer patientId, Integer doctorId, boolean active) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.active = active;
    }

    public Integer getUserId() { return userId; }
    public Integer getPatientId() { return patientId; }
    public Integer getDoctorId() { return doctorId; }
    public User.Role getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}