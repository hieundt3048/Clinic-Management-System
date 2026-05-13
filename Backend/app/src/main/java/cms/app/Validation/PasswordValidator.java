package cms.app.Validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator kiểm tra từng tiêu chí mật khẩu một cách chi tiết.
 * Trả về message cụ thể cho từng điều kiện chưa đáp ứng.
 */
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final int MIN_LENGTH = 8;
    private static final String SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

    @Override
    public void initialize(ValidPassword constraintAnnotation) {}

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            buildMessage(context, "Mật khẩu không được để trống");
            return false;
        }

        // Kiểm tra từng tiêu chí
        boolean hasMinLength   = password.length() >= MIN_LENGTH;
        boolean hasLowercase   = password.chars().anyMatch(Character::isLowerCase);
        boolean hasUppercase   = password.chars().anyMatch(Character::isUpperCase);
        boolean hasDigit       = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars()
                .anyMatch(c -> SPECIAL_CHARS.indexOf(c) >= 0);

        // Nếu tất cả đều đạt → hợp lệ
        if (hasMinLength && hasLowercase && hasUppercase && hasDigit && hasSpecialChar) {
            return true;
        }

        // Tắt message mặc định, thay bằng message chi tiết
        context.disableDefaultConstraintViolation();

        if (!hasMinLength) {
            buildMessage(context, "Mật khẩu phải có ít nhất " + MIN_LENGTH + " ký tự");
        }
        if (!hasLowercase) {
            buildMessage(context, "Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)");
        }
        if (!hasUppercase) {
            buildMessage(context, "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)");
        }
        if (!hasDigit) {
            buildMessage(context, "Mật khẩu phải chứa ít nhất 1 số (0-9)");
        }
        if (!hasSpecialChar) {
            buildMessage(context, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)");
        }

        return false;
    }

    private void buildMessage(ConstraintValidatorContext context, String message) {
        context.buildConstraintViolationWithTemplate(message)
                .addConstraintViolation();
    }
}
