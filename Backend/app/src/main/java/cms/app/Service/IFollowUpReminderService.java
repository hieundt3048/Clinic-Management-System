package cms.app.Service;

import java.util.List;

import cms.app.Dto.FollowUpReminderResponse;

public interface IFollowUpReminderService {

    List<FollowUpReminderResponse> getMyFollowUpReminders(String userEmail, int daysAhead);
}
