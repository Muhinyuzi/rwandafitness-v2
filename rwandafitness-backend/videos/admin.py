from django.contrib import admin

from .models import Video, VideoTranslation


class VideoTranslationInline(admin.StackedInline):
    model = VideoTranslation

    extra = 2
    min_num = 2
    max_num = 2

    fields = (
        "language",
        "title",
        "slug",
        "description",
    )


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "display_title",
        "language",
        "coach",
        "gym",
        "article",
        "is_published",
        "sort_order",
        "created_at",
    )

    list_filter = (
        "language",
        "is_published",
        "created_at",
    )

    search_fields = (
        "translations__title",
        "translations__slug",
        "video_url",
        "coach__user__full_name",
        "gym__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fields = (
        "video_url",
        "language",
        "thumbnail",
        "coach",
        "gym",
        "article",
        "is_published",
        "sort_order",
        "created_at",
        "updated_at",
    )

    inlines = [
        VideoTranslationInline,
    ]

    def display_title(self, obj):
        english_translation = (
            obj.translations.filter(
                language="en",
            ).first()
        )

        if english_translation:
            return english_translation.title

        translation = obj.translations.first()

        if translation:
            return translation.title

        return f"Video #{obj.pk}"

    display_title.short_description = "Title"