package cms.app.Dto;

import java.time.LocalDateTime;

import cms.app.Entity.AppNotification;

public class NotificationResponse {
    private Integer notificationId;
    private String type;
    private String title;
    private String message;
    private String link;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private boolean read;

    public NotificationResponse() {}

    public NotificationResponse(AppNotification notification) {
        this.notificationId = notification.getNotificationId();
        this.type = notification.getType();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.link = notification.getLink();
        this.createdAt = notification.getCreatedAt();
        this.readAt = notification.getReadAt();
        this.read = notification.isRead();
    }

    public Integer getNotificationId() { return notificationId; }
    public void setNotificationId(Integer notificationId) { this.notificationId = notificationId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}