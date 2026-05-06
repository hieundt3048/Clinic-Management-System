package cms.app.Auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }
    // @Bean
    // public CorsConfigurationSource corsConfigurationSource() {
    //     CorsConfiguration configuration = new CorsConfiguration();
    //     configuration.setAllowedOrigins(Arrays.asList(CorsConfigConstants.ALLOWED_ORIGINS));
    //     configuration.setAllowedMethods(Arrays.asList(CorsConfigConstants.ALLOWED_METHODS));
    //     configuration.setAllowedHeaders(Arrays.asList(CorsConfigConstants.ALLOWED_HEADERS));
    //     configuration.setAllowCredentials(CorsConfigConstants.ALLOW_CREDENTIALS);
    //     configuration.setExposedHeaders(Arrays.asList(CorsConfigConstants.EXPOSED_HEADERS));
    //     configuration.setMaxAge(CorsConfigConstants.MAX_AGE);

    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     source.registerCorsConfiguration("/**", configuration);
    //     return source;
    // }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // 1. Cấu hình CORS
        // http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // 2. Tắt CSRF (Cross-Site Request Forgery)
        http.csrf((CsrfConfigurer<HttpSecurity> csrf) -> {
            csrf.disable();
        })
        // Cấu hình phân quyền URL
            .authorizeHttpRequests(auth -> auth
                // Các endpoint công khai — không cần token
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh"
                ).permitAll()

                // Admin-only endpoints
                .requestMatchers("/api/auth/create-staff").hasRole("ADMIN")
                .requestMatchers("/api/appointments/history").hasRole("ADMIN")

                // Tất cả endpoints còn lại cần xác thực
                .anyRequest().authenticated()
            )

            // Stateless — không lưu session
            .sessionManagement(sess ->
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Đăng ký authentication provider
            .authenticationProvider(authenticationProvider())

            // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}