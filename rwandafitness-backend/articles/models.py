from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class Article(models.Model):
    CATEGORY_CHOICES = [
        ("training", "Training"),
        ("nutrition", "Nutrition"),
        ("weight-loss", "Weight Loss"),
        ("muscle-gain", "Muscle Gain"),
        ("gym-tips", "Gym Tips"),
        ("wellness", "Wellness"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    cover_image = models.ImageField(upload_to="articles/", null=True, blank=True)
    author_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="training")

    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while Article.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        if self.is_published and not self.published_at:
            self.published_at = timezone.now()

        if not self.is_published:
            self.published_at = None

        super().save(*args, **kwargs)