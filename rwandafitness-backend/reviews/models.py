from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from coaches.models import CoachProfile
from requests_app.models import CoachingRequest

class ReviewStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class Review(models.Model):
    request = models.OneToOneField(
        CoachingRequest,
        on_delete=models.CASCADE,
        related_name="review",
    )

    coach = models.ForeignKey(
        CoachProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_reviews",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
    )

    comment = models.TextField(
        blank=True,
    )
    
    status = models.CharField(
        max_length=20,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        client_name = (
            getattr(self.client, "full_name", "")
            or getattr(self.client, "username", "")
            or self.client.email
        )

        coach_user = self.coach.user

        coach_name = (
            getattr(coach_user, "full_name", "")
            or getattr(coach_user, "username", "")
            or coach_user.email
        )

        return (
            f"{client_name} → "
            f"{coach_name} "
            f"({self.rating}/5)"
        )