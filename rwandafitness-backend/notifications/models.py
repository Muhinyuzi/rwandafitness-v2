from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ("coaching_request", "Coaching request"),
        ("request_accepted", "Request accepted"),
        ("request_rejected", "Request rejected"),
        ("request_completed", "Request completed"),
        ("review", "Review"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        default="system",
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField(
        blank=True,
    )

    link = models.CharField(
        max_length=500,
        blank=True,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return f"{self.user} - {self.title}"