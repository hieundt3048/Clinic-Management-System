package cms.app.Validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Annotation kiểm tra xác nhận mật khẩu trùng khớp.
 */
@Documented
@Constraint(validatedBy = PasswordMatchValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordMatch {

    String message() default "Xác nhận mật khẩu không trùng khớp";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /** Tên field chứa mật khẩu gốc */
    String password();

    /** Tên field chứa mật khẩu xác nhận */
    String confirmPassword();
}
