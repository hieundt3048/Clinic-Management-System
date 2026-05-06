package cms.app.Dto;

import jakarta.validation.constraints.NotBlank;

/** DTO nhận refresh token để cấp lại access token */
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
