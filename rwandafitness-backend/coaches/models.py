from django.conf import settings
from django.db import models
from gyms.models import Gym


class CoachProfile(models.Model):
    SPECIALTY_CHOICES = [
        ("fitness", "Fitness"),
        ("bodybuilding", "Bodybuilding"),
        ("weight_loss", "Weight Loss"),
        ("crossfit", "CrossFit"),
        ("yoga", "Yoga"),
        ("cardio", "Cardio"),
        ("nutrition", "Nutrition"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_profile",
    )
    bio = models.TextField(blank=True)
    specialty = models.CharField(
        max_length=50,
        choices=SPECIALTY_CHOICES,
        default="fitness",
    )
    years_experience = models.PositiveIntegerField(default=0)
    city = models.CharField(max_length=100, blank=True)
    price_per_session = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_verified = models.BooleanField(default=False)
    photo = models.ImageField(
        upload_to="coaches/photos/",
        null=True,
        blank=True,
    )
    available_online = models.BooleanField(default=False)
    available_in_person = models.BooleanField(default=True)
    instagram = models.URLField(blank=True)

    gym = models.ForeignKey(
        Gym,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coaches",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["user__full_name"]

    def __str__(self):
        return f"{self.user.full_name} ({self.get_specialty_display()})"


class CoachGalleryImage(models.Model):
    coach = models.ForeignKey(
        CoachProfile,
        on_delete=models.CASCADE,
        related_name="gallery_images",
    )
    image = models.ImageField(upload_to="coaches/gallery/")
    caption = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Coach gallery image"
        verbose_name_plural = "Coach gallery images"

    def __str__(self):
        return f"Gallery image for {self.coach.user.full_name}"