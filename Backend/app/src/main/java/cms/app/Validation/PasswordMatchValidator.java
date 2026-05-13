package cms.app.Validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

/**
 * Validator so sánh hai field password và confirmPassword trên DTO.
 * Dùng BeanWrapper của Spring để truy cập field theo tên động.
 */
public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, Object> {

    private String passwordField;
    private String confirmPasswordField;

    @Override
    public void initialize(PasswordMatch annotation) {
        this.passwordField        = annotation.password();
        this.confirmPasswordField = annotation.confirmPassword();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        BeanWrapperImpl wrapper = new BeanWrapperImpl(value);

        Object password        = wrapper.getPropertyValue(passwordField);
        Object confirmPassword = wrapper.getPropertyValue(confirmPasswordField);

        if (password == null && confirmPassword == null) return true;

        boolean match = password != null && password.equals(confirmPassword);

        if (!match) {
            // Gắn lỗi vào field confirmPassword thay vì class-level
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Xác nhận mật khẩu không trùng khớp")
                    .addPropertyNode(confirmPasswordField)
                    .addConstraintViolation();
        }

        return match;
    }
}
