package cms.app.Validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Annotation kiểm tra mật khẩu đáp ứng đủ các tiêu chí bảo mật:
 * - Từ 8 ký tự trở lên
 * - Chứa ít nhất 1 chữ thường (a-z)
 * - Chứa ít nhất 1 chữ hoa (A-Z)
 * - Chứa ít nhất 1 số (0-9)
 * - Chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
 */
@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Mật khẩu không đáp ứng yêu cầu bảo mật";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
