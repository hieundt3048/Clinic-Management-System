package cms.app.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cms.app.Config.CustomUserDetails;
import cms.app.Dto.ApiResponse;
import cms.app.Dto.UserAccountResponse;
import cms.app.Service.UserService;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserService userService;

    public UserManagementController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAccountResponse>>> getAllAccounts() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Lấy danh sách tài khoản thành công", userService.getAllAccounts()));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserAccountResponse>> updateStatus(
            @PathVariable Integer userId,
            @RequestParam boolean active,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        UserAccountResponse result = userService.updateAccountStatus(userId, active, currentUser.getUserId());
        return ResponseEntity.ok(
                new ApiResponse<>(true, active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", result));
    }
}