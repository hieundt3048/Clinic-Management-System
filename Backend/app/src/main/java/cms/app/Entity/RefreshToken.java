package cms.app.Entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Entity lưu Refresh Token trong DB.
 * Cho phép thu hồi token (logout, đổi mật khẩu) và phát hiện token bị đánh cắp.
 */
@Entity
@Table(name = "RefreshToken")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @OneToOne
    @JoinColumn(name = "user_account_id", referencedColumnName = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    // ==================== Constructors ====================

    public RefreshToken() {}

    // ==================== Getters & Setters ====================

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }
}
