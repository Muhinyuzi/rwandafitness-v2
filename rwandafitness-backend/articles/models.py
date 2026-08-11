from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django_ckeditor_5.fields import CKEditor5Field


from django.conf import settings


class Article(models.Model):
    CATEGORY_CHOICES = [
        ("training", "Training"),
        ("nutrition", "Nutrition"),
        ("weight-loss", "Weight Loss"),
        ("muscle-gain", "Muscle Gain"),
        ("gym-tips", "Gym Tips"),
        ("wellness", "Wellness"),
    ]

    cover_image = models.ImageField(
        upload_to="articles/",
        blank=True,
        null=True,
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
    )

    author_name = models.CharField(
        max_length=150,
        blank=True,
    )

    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    published_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        english_translation = self.translations.filter(
            language="en"
        ).first()

        if english_translation:
            return english_translation.title

        return f"Article #{self.pk}"



class ArticleTranslation(models.Model):
    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("rw", "Kinyarwanda"),
    ]

    article = models.ForeignKey(
        "Article",
        on_delete=models.CASCADE,
        related_name="translations",
    )

    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    excerpt = models.TextField()

    content = CKEditor5Field(
        "Content",
        config_name="default",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["article", "language"],
                name="unique_article_translation_language",
            ),
        ]

    def __str__(self):
        return f"{self.article} - {self.language}"