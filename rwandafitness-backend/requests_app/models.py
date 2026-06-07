from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from coaches.models import CoachProfile


class CoachingRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_COMPLETED = "completed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_COMPLETED, "Completed"),
    ]

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coaching_requests",
    )
    coach = models.ForeignKey(
        CoachProfile,
        on_delete=models.CASCADE,
        related_name="coaching_requests",
    )
    goal = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        if self.client.role != "client":
            raise ValidationError("Only users with role 'client' can create a coaching request.")

        if self.coach.user.role != "coach":
            raise ValidationError("Selected coach must belong to a user with role 'coach'.")

    def __str__(self):
        return f"{self.client.full_name} -> {self.coach.user.full_name} ({self.status})"