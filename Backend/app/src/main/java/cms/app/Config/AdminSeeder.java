package cms.app.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import cms.app.Entity.User;
import cms.app.Repository.UserRepository;


@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createAdminIfNotExists(
                "admin@cms.app",
                "Admin@123456",
                "0900000000"
        );
    }

    private void createAdminIfNotExists(String email, String rawPassword, String phone) {
        if (userRepo.existsByEmail(email)) {
            System.out.println("[AdminSeeder] Admin đã tồn tại, bỏ qua.");
            return;
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setPhone(phone);
        admin.setPasswordHash(passwordEncoder.encode(rawPassword));
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(true);

        userRepo.save(admin);
        System.out.println("[AdminSeeder]Đã tạo tài khoản ADMIN: " + email);
    }
}