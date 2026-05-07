package cms.app.Service;

import cms.app.Dto.HealthProfileResponse;
import cms.app.Dto.UpdateHealthProfileRequest;

public interface IHealthProfileService {
    HealthProfileResponse getMyProfile(String email);

    HealthProfileResponse updateMyProfile(String email, UpdateHealthProfileRequest request);
}
