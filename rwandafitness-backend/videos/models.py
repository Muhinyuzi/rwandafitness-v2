from django.db import models


class Video(models.Model):
    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("rw", "Kinyarwanda"),
        ("all", "All languages"),
    ]

    video_url = models.URLField()

    language = models.CharField(
        max_length=3,
        choices=LANGUAGE_CHOICES,
        default="all",
        help_text="Language spoken in the video.",
    )

    coach = models.ForeignKey(
        "coaches.CoachProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="videos",
    )

    gym = models.ForeignKey(
        "gyms.Gym",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="videos",
    )

    article = models.ForeignKey(
        "articles.Article",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="videos",
    )

    thumbnail = models.ImageField(
        upload_to="videos/thumbnails/",
        null=True,
        blank=True,
    )

    is_published = models.BooleanField(
        default=False,
    )

    sort_order = models.PositiveIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "sort_order",
            "-created_at",
        ]

    def __str__(self):
        english_translation = self.translations.filter(
            language="en",
        ).first()

        if english_translation:
            return english_translation.title

        translation = self.translations.first()

        if translation:
            return translation.title

        return f"Video #{self.pk}"


class VideoTranslation(models.Model):
    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("rw", "Kinyarwanda"),
    ]

    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="translations",
    )

    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
    )

    title = models.CharField(
        max_length=255,
    )

    slug = models.SlugField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["video", "language"],
                name="unique_video_translation_language",
            ),
            models.UniqueConstraint(
                fields=["language", "slug"],
                name="unique_video_translation_language_slug",
            ),
        ]

    def __str__(self):
        return f"{self.title} ({self.language})"