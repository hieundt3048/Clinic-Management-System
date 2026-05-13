package cms.app;

import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import cms.app.Dto.RegisterRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class PasswordValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ─────────────────────────────────────────
    // Mật khẩu hợp lệ
    // ─────────────────────────────────────────

    @Test
    void password_valid_noViolations() {
        RegisterRequest req = buildRequest("StrongPass1!", "StrongPass1!");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "Abcdef1!",        // đúng tối thiểu 8 ký tự
        "MyP@ssw0rd",      // phổ biến
        "Secure#99XYZ",    // có chữ hoa, thường, số, ký tự đặc biệt
    })
    void password_variousValidPasswords_noViolations(String password) {
        RegisterRequest req = buildRequest(password, password);
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        Set<String> messages = getMessages(violations);
        // Không có lỗi liên quan password
        assertThat(messages).noneMatch(m -> m.contains("Mật khẩu phải"));
    }

    // ─────────────────────────────────────────
    // Thiếu từng tiêu chí
    // ─────────────────────────────────────────

    @Test
    void password_tooShort_hasViolation() {
        RegisterRequest req = buildRequest("Ab1!", "Ab1!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("ít nhất 8 ký tự"));
    }

    @Test
    void password_noLowercase_hasViolation() {
        RegisterRequest req = buildRequest("ABCDEF1!", "ABCDEF1!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("chữ thường"));
    }

    @Test
    void password_noUppercase_hasViolation() {
        RegisterRequest req = buildRequest("abcdef1!", "abcdef1!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("chữ hoa"));
    }

    @Test
    void password_noDigit_hasViolation() {
        RegisterRequest req = buildRequest("Abcdefg!", "Abcdefg!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("1 số"));
    }

    @Test
    void password_noSpecialChar_hasViolation() {
        RegisterRequest req = buildRequest("Abcdef12", "Abcdef12");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("ký tự đặc biệt"));
    }

    // ─────────────────────────────────────────
    // Xác nhận mật khẩu
    // ─────────────────────────────────────────

    @Test
    void confirmPassword_mismatch_hasViolation() {
        RegisterRequest req = buildRequest("StrongPass1!", "DifferentPass1!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("không trùng khớp"));
    }

    @Test
    void confirmPassword_match_noViolation() {
        RegisterRequest req = buildRequest("StrongPass1!", "StrongPass1!");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).noneMatch(m -> m.contains("không trùng khớp"));
    }

    // ─────────────────────────────────────────
    // Số điện thoại
    // ─────────────────────────────────────────

    @Test
    void phone_validVietnamese_noViolation() {
        RegisterRequest req = buildRequest("StrongPass1!", "StrongPass1!");
        req.setPhone("0901234567");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertThat(getMessages(violations)).noneMatch(m -> m.contains("điện thoại"));
    }

    @Test
    void phone_invalid_hasViolation() {
        RegisterRequest req = buildRequest("StrongPass1!", "StrongPass1!");
        req.setPhone("12345");
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).anyMatch(m -> m.contains("điện thoại"));
    }

    @Test
    void phone_null_noViolation() {
        // Phone là optional — null thì không lỗi
        RegisterRequest req = buildRequest("StrongPass1!", "StrongPass1!");
        req.setPhone(null);
        Set<String> messages = getMessages(validator.validate(req));
        assertThat(messages).noneMatch(m -> m.contains("điện thoại"));
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    private RegisterRequest buildRequest(String password, String confirmPassword) {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@clinic.com");
        req.setPassword(password);
        req.setConfirmPassword(confirmPassword);
        req.setFullName("Nguyễn Văn A");
        return req;
    }

    private Set<String> getMessages(Set<ConstraintViolation<RegisterRequest>> violations) {
        return violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.toSet());
    }
}
